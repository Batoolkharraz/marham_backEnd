
export const asyncHandler=(fun)=>{
    return (req,res,next)=>{
        fun(req,res,next).catch(err=>{
            return next(new Error(err));
        })
    }
}


export const globalErrorHandel=(err,req,res,next)=>{
    if(process.env.MOOD=='DEV'){
        return res.status(500||err.cause).json({message:"catch error",stack:err.stack})
    }
    else{
        return res.status(500||err.cause).json({message:"catch error"})
    }
}