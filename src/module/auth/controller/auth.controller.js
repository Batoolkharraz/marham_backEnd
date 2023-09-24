import userModel from "../../../../DB/model/user.model.js"
import { generateToken, verifyToken } from "../../../Services/generateAndVerify.js";
import { compare, hash } from "../../../Services/hashAndCompare.js";
import { signupSchema,signinSchema } from "../auth.validation.js";
import { sendEmail } from '../../../Services/sendEmail.js';
import { asyncHandler } from "../../../Services/errorHandling.js";
import { customAlphabet } from "nanoid";

export const signup =async (req,res,next)=>{
    const {userName,email,password} = req.body;
    const user = await userModel.findOne({email});
    if(user){
        return next (new Error("email already exists",{cause:409}));
    }
    let token =generateToken({email},process.env.SIGNUP_TOKEN,60*5);
    const refreshToken = generateToken({email},process.env.SIGNUP_TOKEN,60*60*24);

    const link =`${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
    const Rlink =`${req.protocol}://${req.headers.host}/auth/newConfirmEmail/${refreshToken}`;
    const html = `<a href="${link}">verify email</a>  <br/> <br/> <br/> <a href="${Rlink}"> send new email </a> `
    await sendEmail(email,'confirm email',html)
    const Hpassword=hash(password);
    const createUser = await userModel.create({userName,password:Hpassword,email});
    
    return res.status(201).json({message:"success",user:createUser._id});
}

export const signin = async(req,res,next)=>{
    
    const {email,password}=req.body;

    const user = await userModel.findOne({email});
    if(!user){
        return next(new Error("invalid sign in data"),{cause:400});
    }
    else{
        if(!user.confirmEmail){
            return next(new Error("u must confirm your email"));
        }
        const match = compare(password,user.password);
        if(!match){
            return next(new Error("invalid sign in data"),{cause:400});
        }else{
            const token = generateToken({id:user._id},process.env.SIGNIN_TOKEN,'1h');
            const refreshToken = generateToken({id:user._id},process.env.SIGNIN_TOKEN,60*60*24*365);
            return res.status(200).json({message:"done",token,refreshToken});
        }
    }   
}

export const confirmEmail = async(req,res)=>{
    const {token}=req.params;
    const decoded=verifyToken(token,process.env.SIGNUP_TOKEN);
    if(!decoded?.email){
        return next(new Error("invalid token payload",{cause:409}));
    }
    const user = await userModel.updateOne({email:decoded.email},{confirmEmail:true});
    
    if(user.modifiedCount){
        return res.status(200).redirect(`${process.env.URL}`);
    }
    else{
        return next(new Error("not register account or ur email is verify",{cause:400}))
    }
}

export const newConfirmEmail = async(req,res)=>{
    let {token}=req.params;
    const {email}=verifyToken(token,process.env.SIGNUP_TOKEN);
    if(!email){
        return next(new Error("invalid token payload",{cause:409}));
    }
    const user = await userModel.findOne({email});
    if(!user){
        return next(new Error("invalid user",{cause:409}));
    }
    if(user.confirmEmail){
        return res.status(200).redirect(`${process.env.URL}`)
    }
    token=generateToken({email},process.env.SIGNUP_TOKEN,60*5);
    const link =`${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
    const html = `<a href="${link}">verify email</a>`
    await sendEmail(email,'confirm email',html)
    return res.status(200).send(`<p> new confirm email send to ur inbox</P>`);
}

export const sendCode= asyncHandler(async(req,res,next)=>{
    const {email}=req.body;
    let code = customAlphabet('123456789abcd',4);
    code=code();
    const user = await userModel.findOneAndUpdate({email},{forgetCode:code},{new:true});
    const html =`<p> code is ${code}</p>`
    await sendEmail(email,'forget password',html);
    return res.status(200).json({message:"success",user});
})

export const forgetPassword = asyncHandler( async(req,res,next)=>{
    const {code,email,password}= req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return next(new Error('invalid register account',{cause:400}));
    }
    if(user.forgetCode!=code || !code){
        return next(new Error('invalid code',{cause:400}));
    }
    user.password=hash(password);
    user.forgetCode=null;
    user.changePasswordTime=Date.now();
    await user.save();
    return res.status(200).json(user);
}  
)