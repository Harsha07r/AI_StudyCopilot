import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { ChatGroq } from "@langchain/groq";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

app.get("/",(req,res)=>{
    res.send("AI_StudyCoplit Backend Server is running");
})

app.post("/chat",async (req,res)=>{
    try{
        const {question} =req.body;
        const response=await model.invoke(question);
        res.json({
            reply:response.content,
        });
    }  catch(error){
        console.log(error);
         res.status(500).json({
      error: "Something went wrong",
    });
    }
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})