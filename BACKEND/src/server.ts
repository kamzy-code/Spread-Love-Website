import app from "./app";
import { connectDB } from "./config/dbConfig";
import logger from "./utils/logger";
import dotenv from "dotenv";
dotenv.config();


const PORT = process.env.PORT || 5000;
async function startServer (){
//  connect to the database
    await connectDB();

// start the server
    app.listen(PORT, ()=>{
    logger.info(`server is running on localhost:${PORT}/`, {
        service: "server",
        action: "START_SERVER"
    })
})
}

startServer();