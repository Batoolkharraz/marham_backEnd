
import mongoose, { Schema, model, Types } from 'mongoose';
const scheduleSchema = new Schema({
    duration:{type:Number,required:true},
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    date: { type: String, required: true },
    writtenBy: { type: Types.ObjectId, ref: 'Doctor', required: true },
    
},
    {
        timestamps: true
    })
    
const scheduleModel = mongoose.models.Schedule || model('Schedule', scheduleSchema);
export default scheduleModel;