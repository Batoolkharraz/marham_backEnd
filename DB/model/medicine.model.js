
import mongoose, {Schema,model,Types} from 'mongoose';
const medicineSchema = new Schema ({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    type:{
        type:String,
        required:true,
    },
    createdBy:{type:Types.ObjectId,ref:'Doctor',required:true},
    updatedBy:{type:Types.ObjectId,ref:'Doctor',required:true},
},
{
    timestamps:true
})


const medicineModel = mongoose.models.Medicine ||  model('Medicine', medicineSchema);
export default medicineModel;