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
    req.body.dateFrom = new Date(req.body.dateFrom);
    req.body.dateTo = new Date(req.body.dateTo);
    if (req.body.dateFrom < now || req.body.dateTo < now) {
        return next(new Error(`please check the date again`, { cause: 400 }));
    }
    req.body.dateFrom = req.body.dateFrom.toLocaleDateString();
    req.body.dateTo = req.body.dateTo.toLocaleDateString();

    const prescription = await prescriptionModel.create({
        writtenFor: user._id,
        writtenBy: req.user._id,
        dateFrom:req.body.dateFrom,
        dateTo:req.body.dateTo,
        medicines,
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

export const getPrescriptionByUser = asyncHandler(async (req, res, next) => {
    const prescriptions = await prescriptionModel.find({ writtenFor:req.params.userId });
    if (!prescriptions) {
        return next(new Error(`this prescription not found `));
    }
    return res.status(201).json({ prescriptions });
}) 

export const changeState = asyncHandler(async (req, res, next) => {
    
      const prescriptions = await prescriptionModel.find();
      
      if (!prescriptions || prescriptions.length === 0) {
        return res.status(404).json({ message: 'No prescriptions found' });
      }
  
      let now = new Date();
      now = now.toLocaleDateString(); 
  
      for (const prescription of prescriptions) {
        if (prescription.dateTo < now && prescription.state !== 'Done') {
          await prescriptionModel.findByIdAndUpdate(prescription._id, { state: 'Done' });
        }
      }
  
      return res.status(200).json({ message: ' success' });
    
  });
  

  export const getMedicine = asyncHandler(async (req, res, next) => {
    const prescriptions = await prescriptionModel.find({ writtenFor:req.params.userId });
    if (!prescriptions) {
        return next(new Error(`this prescription not found `));
    }
    return res.status(201).json({ prescriptions });
}) 