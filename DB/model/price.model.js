
import mongoose, { Schema, model, Types } from 'mongoose';
const priceSchema = new Schema({
    doctorId: { type: Types.ObjectId, ref: 'Doctor', required: true },
    price:{ type:String,default:'50'},
},
    {
        timestamps: true
    })

const priceModel = mongoose.models.Price || model('Price', priceSchema);
export default priceModel;