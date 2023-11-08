import usermodel from '../DB/Usermodel.js';
import bcrypt from 'bcrypt';
import cloudinary from "../../../Services/cloudinary.js";
export const signup =async (req,res)=>{
   
const { username, email, phone, password ,role} = req.body;

let hashvalue=await bcrypt.hash(password,8);
const user = await usermodel.findOne({username});
if(user){
    return res.json("false1");
}
const user2 = await usermodel.findOne({email});
if(user2){
    return  res.json("false2");
}
else{
    if(role)
    {
        const {secure_url,public_id}=await cloudinary.uploader.upload(`9035117_person_icon.png`,{folder:`${process.env.APP_NAME}/User`});    
        const createuser2= await usermodel.create({username, email, phone,password: hashvalue,image:{secure_url,public_id}},role);
            return res.json({message:"from signup with role"});
    }
    else
{const {secure_url,public_id}=await cloudinary.uploader.upload(`9035117_person_icon.png`,{folder:`${process.env.APP_NAME}/User`});    
const createuser= await usermodel.create({username, email, phone,password: hashvalue,image:{secure_url,public_id}});
    return res.json({message:"from signup"});}
}
}
