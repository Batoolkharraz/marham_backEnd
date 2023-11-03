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
    },
    role:{
        type:String,
        default:'user',
        enum:['user','admin','super admin']
    },

},{
    timestamps:true
})

const userModel=model('users',userSchema);
export default userModel;