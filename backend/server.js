import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { ChatGroq } from "@langchain/groq";
import uploadRoutes from "./routes/uploadRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import embeddingRoutes from "./routes/embeddingRoutes.js";
dotenv.config();
import vectorStoreRoutes
from "./routes/vectorStoreRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

app.use("/", uploadRoutes);
app.use("/", pdfRoutes);
app.use("/", embeddingRoutes);
app.use("/", vectorStoreRoutes);
app.use("/", chatRoutes);

app.get("/",(req,res)=>{
    res.send("AI_StudyCoplit Backend Server is running");
})

// Add this near your other route definitions
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});




app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})