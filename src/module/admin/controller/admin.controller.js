import searchModel from "../../../../DB/model/search.model.js";
import doctorModel from "../../../../DB/model/doctor.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import { hash } from "../../../Services/hashAndCompare.js";
import userModel from "../../Authalaa/DB/Usermodel.js";
import categoryModel from "../../../../DB/model/category.model.js";
import priceModel from "../../../../DB/model/price.model.js";

export const doctorSignUp = asyncHandler(async (req, res) => {

    const email = req.body.email;
    if (await doctorModel.findOne({ email })) {
        return res.json('false2');
    }

    const category = await categoryModel.findOne({ name: req.body.category });
    console.log(category);
    if (!category) {
        return res.json('false1');
    }
    const Hpassword = hash(req.body.password);

    const { secure_url, public_id } = await cloudinary.uploader.upload(`9035117_person_icon.png`, { folder: `${process.env.APP_NAME}/User` });
    
    const userData = {
        username:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password: Hpassword,
        image: { secure_url, public_id },
        role:'doctor',
        address: req.body.address,
    };

    const user = await userModel.create(userData);

    const doctor = await doctorModel.create({
        name: req.body.name,
        description: req.body.description,
        image: { secure_url, public_id },
        categoryId: category._id,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        password: Hpassword,
    });

     const newdoc=await doctorModel.findOne({email:req.body.email});
    const newPrice = await priceModel.create({
        doctorId:newdoc._id,
        price:50
    });

    return res.status(201).json('success');

})

