import usermodel from '../DB/Usermodel.js';
import bcrypt from 'bcrypt';
export const signup =async (req,res)=>{
   
const { userName, email, phone, password, cpassword } = req.body;

let hashvalue=await bcrypt.hash(password,8);
let hashvalue2=await bcrypt.hash(cpassword,8);
console.log(userName, email, phone,hashvalue,hashvalue2);
const user = await usermodel.findOne({userName});
if(user){
    return res.json("false1");
}
const user2 = await usermodel.findOne({email});
if(user2){
    return  res.json("false2");
}
else
{const createuser= await usermodel.create({userName, email, phone,password: hashvalue,cpassword:hashvalue2});
    return res.json({message:"from signup"});}
}
