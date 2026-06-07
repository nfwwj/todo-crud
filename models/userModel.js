import mongoose from "mongoose"
import bcrypt from 'bcrypt';


const userSchema = new mongoose.Schema(
    {
        username: {type:String,required:true},
        password: {type: String,required:true},
    },
    {
        timestamps: true
    }   
)

// best if schema method is here. if attached to routes, it wld create a circular dependency nightmare. also,
// all User objects wld inerit this method, instead of defining it in every file
userSchema.pre('save', async function() { //middleware that runs when .save() (the built in mongoose method) is called
  try {//why next is parameter

    // Check if the password has been modified
    if (!this.isModified('password')) return
    
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); //this.password refers to what
    

  } catch (error) {
    throw error
  }
});

userSchema.methods.isValidPassword = async function(password) {
  try {
    // Compare provided password with stored hash
    return await bcrypt.compare(password, this.password); //this.password refers to the user object previously
    // password refers to the password thats passed
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};


export const User = mongoose.model("User",userSchema)