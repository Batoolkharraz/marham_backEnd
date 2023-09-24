
import { verifyToken } from '../Services/generateAndVerify.js';
import userModel from "../../DB/model/user.model.js"
import { asyncHandler } from '../Services/errorHandling.js';

export const roles={
    superAdmin:'super admin',
    admin:'admin',
    user:'user',
}

 const auth = (accessRoles=[])=>{
    return asyncHandler(async(req,res,next)=>{
        const {authorization} = req.headers;
        if(!authorization?.startsWith(process.env.BEARER_TOKEN)){
            return next(new Error(`invalid bearer key`,{cause:400}));
        }
        const token = authorization.split(process.env.BEARER_TOKEN)[1];
        if(!token){
            return next(new Error(`invalid token`,{cause:400}));
        }
        const decoded= verifyToken(token,process.env.SIGNIN_TOKEN);
        if(!decoded){
            return next(new Error(`invalid token payload`,{cause:400}));
        }
        const user = await userModel.findById(decoded.id).select('userName email role changePasswordTime');
        if(!user){
            return (new Error(`not register user`,{cause:401}));
        }
        if(!accessRoles.includes(user.role)){
            return next(new Error('not authorized user',{cause:403}));
        }

        if(parseInt(user.changePasswordTime?.getTime()/1000)>decoded.iat){
            return next(new Error("expired token",{cause:400}))
        }
        req.user=user;
        return next();
    })   
}

export default auth;