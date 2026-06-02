import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const loadPDF =async (filePath) =>{
    try{
        const loader =new PDFLoader(filePath);
        const docs = await loader.load();
        return docs;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to load PDF");
    }
}