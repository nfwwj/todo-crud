import express from "express"
import {User} from "../models/userModel.js"
export const router = express.Router()
router.use(express.json());

import { generateToken, verifyToken } from "../services/jwtService.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import fs from "node:fs/promises";

import jwt from "jsonwebtoken";

router.get("/", (req,res)=>{
    let filePath = path.join(__dirname,"..","public","auth","auth.html")
    res.sendFile(filePath,(err)=>{
        if (err) {
                console.log("Error in sending file: ",err)
                res.status(404).send(`Smth went wrong:${err}`)
                res.end()
            }
    })
})

 
router.post("/register", async(req,res)=>{
    try{
        const query = req.body

        //check if null first
        if(!query.username || !query.password){
            return res.status(400).send("Username and password required!")
        }

        //check if already exists
        const result = await User.find({username:query.username}) //returns arr
        if(result.length >= 1){
            return res.status(400).send("Username already exists!")
        }

        const newUser = await User.create({ username: query.username, password: query.password });
        

        res.status(201).send("User created successfully")
    }
    catch(err){
        res.status(500).send("Server error: " + err.message)
    }
})

//login
router.post("/login", async(req,res)=>{
    try {
        const query = req.body
        const user = await User.findOne({username: query.username}); //returns object

        if (!user) {
            return res.status(404).send("Username not found")
        }

        const isMatch = await user.isValidPassword(query.password);
        if (!isMatch) {
            return res.status(400).send("Wrong password!")
        }
        
        const token = generateToken(user._id); // Pass the database ID here
        
        res.status(200).json({"token" : token})
    }
   catch (error) {
    console.error(error)
    res.status(500).send("Server error!")
  }
})



export default router