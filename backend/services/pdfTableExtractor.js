import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const Y_TOLERANCE = 3; // px tolerance for grouping text items into the same line
const X_COLUMN_TOLERANCE = 8; // px tolerance for binning x-start positions into columns
const MIN_TABLE_ROWS = 3; // consecutive tabular lines required to call it a table
const MIN_COLUMNS = 2; // items per line required to be a table-row candidate
const MIN_ROW_MATCH_RATIO = 0.6; // fraction of rows in a run that must fit the reference columns

const round = (value, tolerance) => Math.round(value / tolerance) * tolerance;

// Groups a page's text items into reading-order lines by y-position.
const groupItemsIntoLines = (items) => {
  const sorted = [...items]
    .filter((item) => item.str && item.str.trim() !== "")
    .sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);

  const lines = [];
  for (const item of sorted) {
    const y = item.transform[5];
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - y) <= Y_TOLERANCE) {
      last.items.push(item);
    } else {
      lines.push({ y, items: [item] });
    }
  }

  for (const line of lines) {
    line.items.sort((a, b) => a.transform[4] - b.transform[4]);
  }

  return lines;
};

// Checks whether a line's item x-starts fit the run's reference column bins.
const matchesColumns = (line, columnBins) => {
  const lineBins = new Set(line.items.map((item) => round(item.transform[4], X_COLUMN_TOLERANCE)));
  let matches = 0;
  for (const bin of columnBins) {
    if (lineBins.has(bin)) matches += 1;
  }
  return matches >= MIN_COLUMNS;
};

// Assigns each item in a line to its nearest reference column bin.
const lineToRow = (line, columnBins) => {
  const sortedBins = [...columnBins].sort((a, b) => a - b);
  const row = sortedBins.map(() => "");
  for (const item of line.items) {
    const x = item.transform[4];
    let closestIndex = 0;
    let closestDistance = Infinity;
    sortedBins.forEach((bin, i) => {
      const distance = Math.abs(bin - x);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });
    row[closestIndex] = row[closestIndex] ? `${row[closestIndex]} ${item.str}` : item.str;
  }
  return row;
};

// Splits a page's lines into text and table blocks based on layout.
const detectBlocksInLines = (lines, page) => {
  const blocks = [];
  let paragraphLines = [];
  let i = 0;

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const text = paragraphLines.join(" ").replace(/\s+/g, " ").trim();
    if (text) blocks.push({ type: "text", page, text });
    paragraphLines = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.items.length < MIN_COLUMNS) {
      paragraphLines.push(line.items.map((item) => item.str).join(" "));
      i += 1;
      continue;
    }

    // Look ahead for a run of consecutive candidate rows.
    let end = i;
    while (end < lines.length && lines[end].items.length >= MIN_COLUMNS) end += 1;
    const run = lines.slice(i, end);

    if (run.length >= MIN_TABLE_ROWS) {
      const reference = run.reduce((a, b) => (b.items.length > a.items.length ? b : a));
      const columnBins = [...new Set(reference.items.map((item) => round(item.transform[4], X_COLUMN_TOLERANCE)))];
      const matchingRows = run.filter((l) => matchesColumns(l, columnBins));

      if (matchingRows.length / run.length >= MIN_ROW_MATCH_RATIO) {
        flushParagraph();
        const rows = run.map((l) => lineToRow(l, columnBins));
        blocks.push({ type: "table", page, rows });
        i = end;
        continue;
      }
    }

    // Not a confident table run - treat these lines as prose.
    for (const l of run) {
      paragraphLines.push(l.items.map((item) => item.str).join(" "));
    }
    i = end;
  }

  flushParagraph();
  return blocks;
};

// Extracts a PDF into an ordered list of { type: "text" | "table", page, ... } blocks.
export const extractPageBlocks = async (buffer) => {
  const loadingTask = getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  try {
    const blocks = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const { items } = await page.getTextContent();
      const lines = groupItemsIntoLines(items);
      blocks.push(...detectBlocksInLines(lines, pageNum));
    }

    return blocks;
  } finally {
    await loadingTask.destroy();
  }
};

// Serializes a table's rows into a Markdown table string.
export const tableToMarkdown = (rows) => {
  const [header, ...body] = rows;
  const headerLine = `| ${header.join(" | ")} |`;
  const separatorLine = `| ${header.map(() => "---").join(" | ")} |`;
  const bodyLines = body.map((row) => `| ${row.join(" | ")} |`);
  return [headerLine, separatorLine, ...bodyLines].join("\n");
};
