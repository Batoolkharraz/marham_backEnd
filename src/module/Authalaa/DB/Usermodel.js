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
address:{
    type:String,
    required:true
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
        enum:['user','admin','doctor']
    },
    address:{
        type:String,
    }

},{
    timestamps:true
})

const userModel=model('users',userSchema);
export default userModel;