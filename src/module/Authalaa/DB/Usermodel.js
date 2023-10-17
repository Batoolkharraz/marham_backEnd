import mongoose, { Schema,Types,model } from "mongoose";

const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },

    phone:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    cpassword:{
        type:String,
        required:true,

    }
},{
    timestamps:true
})

const usermodel=model('users',userSchema);
export default usermodel;