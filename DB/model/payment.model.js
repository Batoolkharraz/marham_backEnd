
import mongoose, { Schema, model, Types } from 'mongoose';
const paymentSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Types.ObjectId, ref: 'Doctor', required: true },
    is_paied: { type: Boolean, default: false },
    payMethod: { 
        type: String,
        default:'card',
        enum:['card','paypal'], },
        price:{ type:String},
},
    {
        timestamps: true
    })

const paymentModel = mongoose.models.Payment || model('Payment', paymentSchema);
export default paymentModel;