
import mongoose, { Schema, model, Types } from 'mongoose';
const paymentSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Types.ObjectId, ref: 'Doctor', required: true },
    is_paied: { type: Boolean, default: false },
},
    {
        timestamps: true
    })

const paymentModel = mongoose.models.Payment || model('Payment', paymentSchema);
export default paymentModel;