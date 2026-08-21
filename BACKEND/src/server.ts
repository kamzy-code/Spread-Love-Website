import app from "./app";
import { connectDB } from "./config/dbConfig";
import logger from "./utils/logger";
import { env } from "./config/env";
import { startRecordingCleanupJob } from "./jobs/recordingCleanupJob";

const PORT = env.PORT;
async function startServer (){
//  connect to the database
    await connectDB();

    startRecordingCleanupJob();

// start the server
    app.listen(PORT, ()=>{
    logger.info(`server is running on localhost:${PORT}/`, {
        service: "server",
        action: "START_SERVER"
    })
})
}

startServer();