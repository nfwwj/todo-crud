import express from "express"
import {Todo} from "../models/todoModel.js"
import {User} from "../models/userModel.js"

import path from 'path';
import {authMiddleware} from "../middleware/authMiddleware.js"
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import fs from "node:fs/promises";
// import { router } from "./authRoutes.js";

const router = express.Router()
router.use(express.json());

router.get("/", (req,res)=>{
    let filePath = path.join(__dirname,"..","public","todo","todo.html")
    res.sendFile(filePath,(err)=>{
        if (err) {
                console.log("Error in sending file: ",err)
                res.status(404).send(`Smth went wrong:${err}`)
                res.end()
            }
    })
})
router.use(authMiddleware);

router.get("/get-todo",async(req,res)=>{
    try{
        // for edit model - individual todo item
        const id = req.query.id 
        if (id){
            const todo_item = await Todo.findById(id)
            res.json(todo_item)
        }
        else{
            const queryPage = parseInt(req.query.page)
            const page = isNaN(queryPage) ? 1 : queryPage //so that it defaults to 1
            
            const limit = 3;
            const skip = (page-1) * limit //num items to skip e.g. 1st page skip 0, 2nd skip 3
            if (skip < 0){
                return res.status(200)
            }
            const query = {user:req.user.id}

            if (req.query.filter){
                query.type = req.query.filter // add type to query if exists (filter)
            }

            // distinct todo type (for top nav bar)
            const distinct_types = await Todo.distinct("type",{user:req.user.id})

            
            const todo_items_count = await Todo.countDocuments(query) // total num of todo items (for page)
            const total_pages = Math.ceil(todo_items_count/limit) // total pages
           
            const todo_items = await Todo.find(query).skip(skip).limit(limit).sort({done: 1}) // todo items for specific page

            res.json({
                "distinct_types":distinct_types,
                "todo_items" : todo_items,
                "total_pages" : total_pages,
                "current_page" : parseInt(page),
                "limit" : limit
            
            })
        }
        
    }
    catch(err){
        console.error("GET /todo error:", err)
        res.status(500).send("Server error.")
    }
})

router.delete("/", async(req,res)=>{
    try{
        const query = req.body.id 
        if (req.body.deleteall == true){
            const result = await Todo.deleteMany({user:req.user.id, done:true})
            res.status(200).send(`Successfully deleted ${result.deletedCount} items`)
        }
        else{
            try{
                const result = await Todo.deleteOne({_id: query})
                res.status(200).send("Todo deleted successfully")
            }
            catch(err){
                res.status(404).send(`Smth went wrong:${err}`)
            }
    }
}
    catch(err){
        res.status(500).send("Server error")
    }
})

router.post("/", async(req,res)=>{
    try{
        
        const query = {"task": req.body.task,
            "type": req.body.type,
            "user": req.user.id
        }
        const result = await Todo.create(query)
        res.status(201).send("Todo created successfully")
    }
    catch(err){
        res.status(500).send("Server error: " + err.message)
    }
})


router.put("/", async(req,res)=>{
    try{
        if (req.body.done != undefined){
            const todo_item = await Todo.findByIdAndUpdate(req.body.id,
                {
                    done: req.body.done
                }
            )
        }
        else{

        
        const todo_item = await Todo.findByIdAndUpdate(req.body.id,
            {
                task: req.body.task,
                type: req.body.type
            }
        )
    }

        res.status(200).send("Todo updated successfully")
    }
    catch(err){
        res.status(500).send("Server error: " + err.message)
    }
})

router.get("/get-user", async(req,res)=>{
    try{
        const id = req.user.id
        const user = await User.findById(id)
        res.status(200).json({"username":user.username})
    }
    catch(err){
        console.error("GET /get-user error:", err)
        res.status(500).send("Server error.")
    }
})

export default router