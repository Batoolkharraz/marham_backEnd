import mongoose from 'mongoose';
const connectDBUser= async()=>{
 return  await mongoose.connect("mongodb+srv://batoolkharraz:batool017@cluster0.l9n8jny.mongodb.net/marham")
.then(res=>{
    console.log("sucess");})
    .catch(error=>{
        console.log(`there is error : ${error}`);
    })
}
export default connectDBUser;