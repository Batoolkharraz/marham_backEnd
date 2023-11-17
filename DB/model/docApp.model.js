
import mongoose, { Schema, model, Types } from 'mongoose';
const appointmentSchema = new Schema({
    bookedFor: { type: Types.ObjectId, ref: 'Doctor', required: true },
    bookInfo:[{
        bookId: { type: Types.ObjectId, ref: 'Schedule', required: true },
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        is_attend: { type: Boolean, default: false },
        is_canceled: { type: Boolean, default: false },
    }],
},
    {
        timestamps: true
    })

const appointmentModel = mongoose.models.Appointment || model('Appointment', appointmentSchema);
export default appointmentModel;