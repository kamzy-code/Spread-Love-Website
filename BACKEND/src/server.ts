import app from "./app";

const PORT = process.env.PORT || 5000;
function startServer (){

    app.listen(PORT, ()=>{
    console.log(`server is running on localhost:${PORT}/`)
})
}

startServer();