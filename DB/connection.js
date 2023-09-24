import mongoose from 'mongoose';


const connectDb = async ()=>{
   
   return await mongoose.connect(process.env.DB_LOCAL)
}

export default connectDb;