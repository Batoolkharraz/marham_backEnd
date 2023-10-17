import usermodel from '../DB/Usermodel.js';
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';
export const signin=async(req,res)=>{
const{username,password}=req.body;
const user=await usermodel.findOne({username});
if(!user)
{
    return res.json(false);
}
const match=bcrypt.compareSync(password,user.password);
if(!match)
{
    return res.json(false);
}
else{
    const token=Jwt.sign({username:username,password:password,isLoggedIn:true},'blogNode3123',{expiresIn: '1h'})
    return res.json({message:"success",token});
}
}