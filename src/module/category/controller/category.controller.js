import categoryModel from "../../../../DB/model/category.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createCategory=asyncHandler(async (req,res,next)=>{

    const name=req.body.name;

    if(await categoryModel.findOne({name})){
        return next(new Error(`duplicateed category name ${name}`,{cause:409}));
    }
    const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`${process.env.APP_NAME}/category`});
    const category=await categoryModel.create({
        name,
        description:req.body.description,
        image:{secure_url,public_id}});
    return res.status(201).json({category});

})

export const updateCategory=asyncHandler(async (req,res,next)=>{

    const name=req.body.name;

    const category= await categoryModel.findOne({name});

    if(!category){
        return next (new Error ("invalid category name"));
    }

    if(req.body.Nname){
        if(await categoryModel.findOne({name:req.body.Nname})){
            return next(new Error(`duplicateed category name `,{cause:409}));
        }
        if(category.name==req.body.Nname){
            return next(new Error(`old name match the new name `,{cause:400}));
        }
        category.name=req.body.Nname;
    }

    if(req.file){
        const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`${process.env.APP_NAME}/category`});
        await cloudinary.uploader.destroy(category.image.public_id);
        category.image={secure_url,public_id}
    }

    if(req.body.description){
        category.description=req.body.description;
    }
    await category.save();
    return res.json({category})
})


export const getAllCategory=asyncHandler(async (req,res,next)=>{

    const categories= await categoryModel.find();
    return res.status(200).json({categories})

})

export const getCategory=asyncHandler(async (req,res,next)=>{

    const category= await categoryModel.findById(req.params.categoryId);
    return res.status(200).json({category})

})

export const deleteCategory=asyncHandler(async (req,res,next)=>{
    const name=req.body.name;
    const category= await categoryModel.findOne({name});

    if(!category){
        return next(new Error("category not found"));
    }

    await categoryModel.findByIdAndDelete(category._id)
    return res.status(200).json({message:"success"})

})
