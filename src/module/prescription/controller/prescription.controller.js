import prescriptionModel from "../../../../DB/model/prescription.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import medicineModel from "../../../../DB/model/medicine.model.js";
import userModel from "../../../../DB/model/user.model.js";


export const createPrescription = asyncHandler(async (req, res, next) => {

    const { medicines, email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return next(new Error(`invalid user`, { cause: 400 }));
    }

    let now = new Date();
    const medicineList = [];
    const medicineIds = [];
    for (const medicine of medicines) {
        const checkmedicine = await medicineModel.findById(medicine.medicineId);
        if (!checkmedicine) {
            return next(new Error(`invalid medicine`, { cause: 400 }));
        }
        medicine.dateFrom = new Date(medicine.dateFrom);
        medicine.dateTo = new Date(medicine.dateTo);
        if (medicine.dateFrom < now || medicine.dateTo < now) {
            return next(new Error(`please check the date again`, { cause: 400 }));
        }
        medicine.dateFrom = medicine.dateFrom.toLocaleDateString();
        medicine.dateTo = medicine.dateTo.toLocaleDateString();


        medicineList.push(medicine);
        medicineIds.push(medicine.medicineId);
    }
    const prescription = await prescriptionModel.create({
        writtenFor: user._id,
        writtenBy: req.user._id,
        medicines: medicineList,
    })

    return res.status(201).json({ prescription });
})

export const deletePrescription = asyncHandler(async (req, res, next) => {
    const { prescriptionId } = req.params;
    const prescription = await prescriptionModel.findById({ prescriptionId });
    if (!prescription) {
        return next(new Error(`not found`));
    }
    await prescriptionModel.findByIdAndDelete(prescriptionId);
    return res.status(201).json({ message: "success" });
})

//needs update
export const updatePrescription = asyncHandler(async (req, res, next) => {
    const { prescriptionId } = req.params;
    const { medicineId } = req.body;
    const prescription = await prescriptionModel.findOne({ _id: prescriptionId });
    if (!prescription) {
        return next(new Error(`this prescription not found `));
    }

    if (req.body.qty) {

        return next(new Error(`fail to change status this order`, { cause: 400 }));
    }
    return res.status(201).json({ message: "success" });
})

export const getPrescription = asyncHandler(async (req, res, next) => {
    const prescription = await prescriptionModel.findById( req.params.prescriptionId );
    if (!prescription) {
        return next(new Error(`this prescription not found `));
    }
    return res.status(201).json({ prescription });
}) 
