import medicineModel from "../../../../DB/model/medicine.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createMedicine = asyncHandler(async (req, res, next) => {

    const name = req.body.name;

    if (await medicineModel.findOne({ name })) {
        return next(new Error(`duplicateed medicine name ${name}`, { cause: 409 }));
    }
    const medicine = await medicineModel.create({
        name,
        type: req.body.type,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });
    return res.status(201).json({ medicine });

})

export const updateMedicine = asyncHandler(async (req, res, next) => {

    const name = req.body.name;

    const medicine = await medicineModel.findOne({ name });

    if (!medicine) {
        return next(new Error("invalid medicine name"));
    }
    if (req.body.Nname) {
        if (await medicineModel.findOne({ name: req.body.Nname })) {
            return next(new Error(`duplicateed medicine name `, { cause: 409 }));
        }
        if (medicine.name == req.body.Nname) {
            return next(new Error(`old name match the new name `, { cause: 400 }));
        }
        medicine.name = req.body.Nname;
    }

    if (req.body.type) {
        medicine.type = req.body.type;
    }
    medicine.updatedBy = req.user._id;
    await medicine.save();
    return res.json({ medicine })
})


export const getAllMedicine = asyncHandler(async (req, res, next) => {

    const medicines = await medicineModel.find();
    return res.status(200).json({ medicines })

})

export const getMedicine = asyncHandler(async (req, res, next) => {

    const medicine = await medicineModel.findById(req.params.medicineId);
    return res.status(200).json({ medicine })

})

export const deleteMedicine = asyncHandler(async (req, res, next) => {
    const medicine = await medicineModel.findById( req.params.medicineId );
    if (!medicine) {
        return next(new Error("medicine not found"));
    }

    await medicineModel.findByIdAndDelete(medicine._id)
    return res.status(200).json({ message: "success" })

})
