
import mongoose, {Schema,model,Types} from 'mongoose';
const doctorSchema = new Schema ({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        type:Object,
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
    status:{
        type:String,
        defult:'active',
        enum:['active','not_active'],
    },
    address:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    rate:{
        type:Number
    },
    categoryId:{type:Types.ObjectId,ref:'Category',required:true},
},
{
    timestamps:true
})


const doctorModel = mongoose.models.Doctor ||  model('Doctor', doctorSchema);
export default doctorModel;