import usermodel from '../DB/Usermodel.js';
import bcrypt from 'bcrypt';
export const signup =async (req,res)=>{
   
const { username, email, phone, password } = req.body;

let hashvalue=await bcrypt.hash(password,8);
console.log(username, email, phone,hashvalue);
const user = await usermodel.findOne({username});
if(user){
    return res.json("false1");
}
const user2 = await usermodel.findOne({email});
if(user2){
    return  res.json("false2");
}
else
{const createuser= await usermodel.create({username, email, phone,password: hashvalue});
    return res.json({message:"from signup"});}
}
