import categoryModel from "../../../../DB/model/category.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import slugify from "slugify";
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createCategory=asyncHandler(async (req,res,next)=>{
    
    const name=req.body.name.toLowerCase();

    if(await categoryModel.findOne({name})){
        return next(new Error(`duplicateed category name ${name}`,{cause:409}));
    }
    const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`${process.env.APP_NAME}/category`});
    const category=await categoryModel.create({name,slug:slugify(name),image:{secure_url,public_id},createdBy:req.user._id,updatedBy:req.user._id});
    return res.status(201).json({message:"success",category});

})

export const updateCategory=asyncHandler(async (req,res,next)=>{
    const category= await categoryModel.findById(req.params.categoryId);

    if(!category){
        return next (new Error ("invalid category Id"));
    }

    if(req.body.name){
        if(await categoryModel.findOne({name:req.body.name})){
            return next(new Error(`duplicateed category name `,{cause:409}));
        }
        if(category.name==req.body.name){
            return next(new Error(`old name match the new name `,{cause:400}));
        }
        category.name=req.body.name;
        category.slug=slugify(req.body.name);
    }

    if(req.file){
        const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`${process.env.APP_NAME}/category`});
        await cloudinary.uploader.destroy(category.image.public_id);
        category.image={secure_url,public_id}
    }
    category.updatedBy=req.user._id;
    await category.save();
    return res.json({message:"success",category})
})

export const getCategory=asyncHandler(async (req,res,next)=>{

    const category= await categoryModel.findById(req.params.categoryId);
    return res.status(200).json({message:"success",category})

})

export const getAllCategory=asyncHandler(async (req,res,next)=>{

    const categories= await categoryModel.find().populate('subcategory');
    return res.status(200).json({message:"success",categories})

})