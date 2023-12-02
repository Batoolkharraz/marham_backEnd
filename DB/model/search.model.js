
import mongoose, { Schema, model, Types } from 'mongoose';
const searchSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'user', required: true },
    searchList: [{
        categoryList: [{ type: Types.ObjectId, ref: 'Category', required: true }],
        addressList: [{
            type: String,
            required: true,
        }],
    }],
},
    {
        timestamps: true
    })


const searchModel = mongoose.models.Search || model('Search', searchSchema);
export default searchModel;