import usermodel from '../DB/Usermodel.js';
import bcrypt from 'bcrypt';
export const signup =async (req,res)=>{
   
const { userName, email, phone, password } = req.body;

let hashvalue=await bcrypt.hash(password,8);
console.log(userName, email, phone,hashvalue);
const user = await usermodel.findOne({userName});
if(user){
    return res.json("false1");
}
const user2 = await usermodel.findOne({email});
if(user2){
    return  res.json("false2");
}
else
{const createuser= await usermodel.create({userName, email, phone,password: hashvalue});
    return res.json({message:"from signup"});}
}
