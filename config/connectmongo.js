import mongoose from "mongoose"
import {config} from "./mongo.js"

async function connectDB (){
    let mongoStatus = "disconnected"
    try{
        await mongoose.connect(config.mongodb.uri,config.mongodb.options)
        mongoStatus = "connected"
        console.log("Connected to todo database")
        return {status: mongoStatus}
    }
    catch(err){
        // console.error("Failed to connect to todo database: ",err.message)
        return {status: mongoStatus, error: err.message}
    }
}

export default connectDB

