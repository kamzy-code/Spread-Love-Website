import app from "./app";
import { connectDB } from "./config/dbConfig";
import logger from "./utils/logger";
import { env } from "./config/env";
import { startRecordingCleanupJob } from "./jobs/recordingCleanupJob";
import { startEmailQueueJob } from "./jobs/emailQueueJob";
import { startAbandonedBookingCleanupJob } from "./jobs/abandonedBookingCleanupJob";

const PORT = env.PORT;
async function startServer (){
//  connect to the database
    await connectDB();

    startRecordingCleanupJob();
    startEmailQueueJob();
    startAbandonedBookingCleanupJob();

// start the server
    app.listen(PORT, ()=>{
    logger.info(`server is running on localhost:${PORT}/`, {
        service: "server",
        action: "START_SERVER"
    })
})
}

startServer();