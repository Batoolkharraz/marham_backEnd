
import mongoose, {Schema,model,Types} from 'mongoose';
const categorySchema = new Schema ({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        type:Object,
        required:true,
    },
},
{
    timestamps:true
})


const categoryModel = mongoose.models.Category ||  model('Category', categorySchema);
export default categoryModel;