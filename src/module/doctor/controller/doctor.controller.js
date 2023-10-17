import categoryModel from "../../../../DB/model/category.model.js";
import doctorModel from "../../../../DB/model/doctor.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import { hash } from "../../../Services/hashAndCompare.js";

export const createDoctor=asyncHandler(async (req,res,next)=>{

    const email =req.body.email;
    if(await doctorModel.findOne({email})){
        return next(new Error(`you already have an acount with this email ${req.body.email}`,{cause:409}));
    }

    const category=await categoryModel.findOne({name:req.body.category});
    if(!category ){
        return next(new Error(`there is no category with this name ${req.body.category}`,{cause:409}));
    }

    const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`${process.env.APP_NAME}/doctor`});
    const Hpassword=hash(req.body.password);
    const doctor=await doctorModel.create({
        name:req.body.name,
        description:req.body.description,
        image:{secure_url,public_id},
        categoryId:category._id,
        email:req.body.email,
        phone:req.body.phone,
        address:req.body.address,
        password:Hpassword,
        updatedBy:req.user._id});
    return res.status(201).json({doctor});

})

export const updateDoctor=asyncHandler(async (req,res,next)=>{

    const email=req.body.email;

    const doctor= await doctorModel.findOne({email});

    if(!doctor){
        return next (new Error ("invalid doctor email"));
    }

    if(req.body.name){
        if(doctor.name==req.body.name){
            return next(new Error(`old name match the new name `,{cause:400}));
        }
        doctor.name=req.body.name;
    }

    if(req.file){
        const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`${process.env.APP_NAME}/category`});
        await cloudinary.uploader.destroy(category.image.public_id);
        category.image={secure_url,public_id}
    }

    if(req.body.description){
        doctor.description=req.body.description;
    }
    
    if(req.body.phone){
        doctor.phone=req.body.phone;
    }
    
    if(req.body.address){
        doctor.address=req.body.address;
    }
    
    if(req.body.description){
        doctor.description=req.body.description;
    }
    
    if(req.body.description){
        doctor.description=req.body.description;
    }
    doctor.updatedBy=req.user._id;
    await doctor.save();
    return res.json({doctor})
})


export const getAllDoctor=asyncHandler(async (req,res,next)=>{

    const doctors= await doctorModel.find();
    return res.status(200).json({doctors})

})

export const getDoctor=asyncHandler(async (req,res,next)=>{

    const doctor= await doctorModel.findById(req.params.doctorId);
    return res.status(200).json({doctor})

})

export const deleteDoctor=asyncHandler(async (req,res,next)=>{
    const email=req.body.email;
    const doctor= await doctorModel.findOne({email});

    if(!doctor){
        return next(new Error("doctor not found"));
    }

    await doctorModel.findByIdAndDelete(doctor._id)
    return res.status(200).json({message:"success"})

})

export const getDoctorByCat=asyncHandler(async (req,res,next)=>{

    const doctors= await doctorModel.find({categoryId:req.params.categoryId});
    return res.status(200).json({doctors})

})