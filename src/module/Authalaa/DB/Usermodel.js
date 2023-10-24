import mongoose, { Schema,Types,model } from "mongoose";

const userSchema = new Schema({
    username:{
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
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    image:{
        type:Object,
    }

},{
    timestamps:true
})

const userModel=model('users',userSchema);
export default userModel;