import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import vectorStoreRoutes from "./routes/vectorStoreRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

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