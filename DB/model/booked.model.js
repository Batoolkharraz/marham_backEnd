
import mongoose, { Schema, model, Types } from 'mongoose';
const bookedSchema = new Schema({
    bookedBy: { type: Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Types.ObjectId, ref: 'Schedule', required: true },
    doctorId: { type: Types.ObjectId, ref: 'Doctor', required: true },
    is_attend: { type: Boolean, default: false },
},
    {
        timestamps: true
    })

const bookedModel = mongoose.models.Booked || model('Booked', bookedSchema);
export default bookedModel;