import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        // task_num:{type:Number, required:true, index:{unique:true}},
        task: {type:String, required: true},
        type: {type:String, required: true},
        user: {type:String},
        done: {Boolean}
    },
    {
        timestamps: true
    }
)
export const Todo = mongoose.model("Todo",todoSchema)

