
import mongoose, { Schema, model, Types } from 'mongoose';
const scheduleSchema = new Schema({
    writtenBy: { type: Types.ObjectId, ref: 'Doctor', required: true },
    scheduleByDay: [{
            duration:{type:Number,required:true},
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            date: { type: String, required: true },
            timeSlots: [{
                time: { type: String },
                is_booked: { type: Boolean, default: false },
            }]
    }],
    
},
    {
        timestamps: true
    })

const scheduleModel = mongoose.models.Schedule || model('Schedule', scheduleSchema);
export default scheduleModel;