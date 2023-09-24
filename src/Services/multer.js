import multer from "multer";
import { nanoid } from "nanoid";
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));

export const HME=(err,req,res,next)=>{
    if(err){
        return res.status(400).json({message:"multer error",err});
    }else{
        next();
    }
}

export const fileValidation={
    image:['image/jpeg','image/png','image/jpg'],
    file:['application/pdf']
}

function fileUpload(customPath='public',customValidation=[]){
    const fullPath=path.join(__dirname,`../upload/${customPath}`);
    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath,{recursive:true});
    }
    console.log(fullPath);
    console.log();
    const storage =  multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,fullPath)
        },
        filename:(req,file,cb)=>{
            const suffixName=nanoid()+file.originalname;
            file.dest=`upload/${customPath}/${suffixName}`
            cb(null,suffixName)
        },
    })

    function fileFilter(req,file,cb){       
        if(customValidation.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb("invalid format",false);
        }
    }
    const upload = multer({fileFilter,storage})
    return upload;
}

export default fileUpload;