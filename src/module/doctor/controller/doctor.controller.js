import searchModel from "../../../../DB/model/search.model.js";
import doctorModel from "../../../../DB/model/doctor.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import { hash } from "../../../Services/hashAndCompare.js";
import userModel from "../../Authalaa/DB/Usermodel.js";
import categoryModel from "../../../../DB/model/category.model.js";

export const createDoctor = asyncHandler(async (req, res, next) => {

    const email = req.body.email;
    if (await doctorModel.findOne({ email })) {
        return next(new Error(`you already have an acount with this email ${req.body.email}`, { cause: 409 }));
    }

    const category = await categoryModel.findOne({ name: req.body.category });
    if (!category) {
        return next(new Error(`there is no category with this name ${req.body.category}`, { cause: 409 }));
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/doctor` });
    const Hpassword = hash(req.body.password);
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
    return res.status(201).json({ doctor });

})

export const updateDoctor = asyncHandler(async (req, res, next) => {

    const email = req.body.email;

    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
        return next(new Error("invalid doctor email"));
    }

    if (req.body.name) {
        if (doctor.name == req.body.name) {
            return next(new Error(`old name match the new name `, { cause: 400 }));
        }
        doctor.name = req.body.name;
    }

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/doctor` });
        await cloudinary.uploader.destroy(doctor.image.public_id);
        doctor.image = { secure_url, public_id }
    }

    if (req.body.description) {
        doctor.description = req.body.description;
    }

    if (req.body.phone) {
        doctor.phone = req.body.phone;
    }

    if (req.body.address) {
        doctor.address = req.body.address;
    }

    await doctor.save();
    return res.json({ doctor })
})

export const getAllDoctor = asyncHandler(async (req, res, next) => {

    const doctors = await doctorModel.find();
    return res.status(200).json({ doctors })

})

export const getDoctor = asyncHandler(async (req, res, next) => {

    const doctor = await doctorModel.findById(req.params.doctorId);
    return res.status(200).json(doctor);

})

export const deleteDoctor = asyncHandler(async (req, res, next) => {
    const email = req.body.email;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
        return next(new Error("doctor not found"));
    }

    await doctorModel.findByIdAndDelete(doctor._id)
    return res.status(200).json({ message: "success" })

})

export const getDoctorByCat = asyncHandler(async (req, res, next) => {

    const doctors = await doctorModel.find({ categoryId: req.params.categoryId });
    return res.status(200).json({ doctors })

})

export const getDoctorByUserSearch = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;
    const search = await searchModel.findOne({ userId }).populate('searchList.categoryList');
    const categoryIdSet = new Set();
    const addressSet = new Set();
    const doctorSetCat = new Set();
    const doctorSetAdd = new Set();
    if (search) {
        console.log(search);
        for (const searchList of search.searchList) {
            for (const categoryList of searchList.categoryList) {
                const categoryId = categoryList._id;
                console.log(categoryId);
                if (!categoryIdSet.has(categoryId)) {
                    categoryIdSet.add(categoryId);
                }
            }
            for (const addressList of searchList.addressList) {
                const address = addressList;
                if (!addressSet.has(address)) {
                    addressSet.add(address);
                }
            }
        }

        const categoryList = Array.from(categoryIdSet);
        const addressList = Array.from(addressSet);

        for (const category of categoryList) {
            const doctor = await doctorModel.findOne({ categoryId: category });
            if (doctor) {
                doctorSetCat.add(doctor);
            }
        }
        for (const address of addressList) {
            const doctor = await doctorModel.findOne({ address });
            if (doctor) {
                doctorSetAdd.add(doctor);
            }
        }
        const doctorList = new Set([...doctorSetCat, ...doctorSetAdd]);
        const uniqueDoctors = new Set();

        for (const doctor of doctorList) {
            const doctorString = JSON.stringify(doctor);

            if (!uniqueDoctors.has(doctorString)) {
                uniqueDoctors.add(doctorString);
            }
        }
        const uniqueDoctorArray = Array.from(uniqueDoctors).map((doctorString) => JSON.parse(doctorString));
        if (uniqueDoctorArray.length < 5) {
            const user = await userModel.findById(userId);
            const doctors = await doctorModel.find({ address: "Nablus" });
            for (const doctor of doctors) {
                const doctorString = JSON.stringify(doctor);

                if (!uniqueDoctors.has(doctorString)) {
                    uniqueDoctors.add(doctorString);
                }
            }
            const uniqueDoctor = Array.from(uniqueDoctors).map((doctorString) => JSON.parse(doctorString));
            const limitedDoctors = uniqueDoctor.slice(0, 8);
            return res.status(200).json(limitedDoctors);
        }

        return res.status(200).json(uniqueDoctorArray);
    }
    else {
        const user = await userModel.findById(userId);
        const doctors = await doctorModel.find({ address: "Nablus" }).limit(8);
        return res.status(200).json(doctors);
    }

});

export const getDoctorByEmail = asyncHandler(async (req, res, next) => {
    
    const user = await userModel.findById(req.params.docId);
    const email=user.email;
    const doctor = await doctorModel.findOne({email});
    return res.status(200).json(doctor);

})
