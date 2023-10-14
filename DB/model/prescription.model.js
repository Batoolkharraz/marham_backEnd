
import mongoose, { Schema, model, Types } from 'mongoose';
const prescriptionSchema = new Schema({
    medicines: [{
        medicineId: { type: Types.ObjectId, ref: 'Medicine', required: true },
        qty: { type: Number, required: true },
        dateFrom: { type: Date, required: true },
        dateTo: { type: Date, required: true },
        time:{
            type:String,
            default:'night',
            enum:['morning','noon','night'],
        }
    }],
    writtenBy: { type: Types.ObjectId, ref: 'Doctor', required: true },
    writtenFor: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'Doctor' },
},
    {
        timestamps: true
    })
const prescriptionModel = mongoose.models.Prescription || model('Prescription', prescriptionSchema);
export default prescriptionModel;