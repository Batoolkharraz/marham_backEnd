
import mongoose, { Schema, model, Types } from 'mongoose';
const pointSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    point:{ type:Number,default:0},
},
    {
        timestamps: true
    })

const pointModel = mongoose.models.Point || model('Point', pointSchema);
export default pointModel;