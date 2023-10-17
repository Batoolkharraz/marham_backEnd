
import mongoose, { Schema, model, Types } from 'mongoose';
const prescriptionSchema = new Schema({
    diagnosis:{type:String,required:true},
    medicines: [{
        medicine: { type:String, required: true },
        description: { type: String, required: true },
        time:[{
            type:String,
            default:'night',
            enum:['morning','noon','night'],
        }]
    }],
    dateFrom: { type: String, required: true },
    dateTo: { type: String, required: true },
    writtenBy: { type: Types.ObjectId, ref: 'Doctor', required: true },
    writtenFor: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'Doctor' },
    state:{
        type:String,
        default:'Still not Done',
        enum:['Still not Done','Done'],
    }
},
    {
        timestamps: true
    })
const prescriptionModel = mongoose.models.Prescription || model('Prescription', prescriptionSchema);
export default prescriptionModel;