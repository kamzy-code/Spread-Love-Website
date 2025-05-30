import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddlewrare, checkRole } from "./middlewares/authMiddleware";
import authRouter from "./routes/authRoute";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("API is running!");
});

app.use("/api/auth", authRouter);




export default app;
