import 'dotenv/config'
import express from "express"
import connectDB from "./config/connectmongo.js"
//  import { Todo } from "./models/todoModel.js"; // Make sure you have your model imported
import todoRoutes from "./routes/todoRoutes.js"
import authRoutes from "./routes/authRoutes.js"

const app = express()
app.use(express.static("public"))
app.use(express.json())

const PORT = process.env.PORT 

async function startServer(){
    console.log("starting server...")
    try{
        let connectstatus = await connectDB()
        if (connectstatus.status != "connected"){
            console.error("Failed to connect to the database:" , connectstatus.error)
            process.exit(1);
        }
       
        app.listen(PORT, ()=>{
            console.log(`Server is running on http://localhost:${PORT}`);
        }).on("error", (err)=>{
            if (err.code == "EADDRINUSE"){
                console.error(`Port ${PORT} is busy. Try killing the process or using a different port!`);
                process.exit(1); 
            }
        })
    }
    catch(err){
        console.error("Failed to start the server: ",err.message)
    }
}

app.use("/todo",todoRoutes)
app.use("/auth",authRoutes)






















startServer()

