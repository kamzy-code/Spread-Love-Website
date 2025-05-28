import app from "./app";
import { connectDB } from "./config/dbConfig";


const PORT = process.env.PORT || 5000;
async function startServer (){
//  connect to the database
    await connectDB();

// start the server
    app.listen(PORT, ()=>{
    console.log(`server is running on localhost:${PORT}/`)
})
}

startServer();