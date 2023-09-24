import mongoose, { Schema,Types,model } from "mongoose";

const userSchema = new Schema({
    userName:{
        type:String,
        required:[true,'user name is required'],
        min:[2],
        max:[20],
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    image:{
        type:Object,
    },
    phone:{
        type:String,
    },
    role:{
        type:String,
        default:'user',
        enum:['user','admin','super admin']
    },
    status:{
        type:String,
        defult:'active',
        enum:['active','not_active'],
    },
    gender:{
        type:String,
        enum:['male','female'],
    },
    address:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    confirmEmail:{
        type:Boolean,
        default:false,
    },
    forgetCode:{
        type:String,
        defult:null
    },
    changePasswordTime:{
        type:Date
    },
},{
    timestamps:true
})

const userModel = mongoose.models.user || model('user',userSchema);
export default userModel;
