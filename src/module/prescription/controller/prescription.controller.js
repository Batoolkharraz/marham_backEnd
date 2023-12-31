import prescriptionModel from "../../../../DB/model/prescription.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import doctorModel from "../../../../DB/model/doctor.model.js";
import userModel from "../../Authalaa/DB/Usermodel.js";


export const createPrescription = asyncHandler(async (req, res, next) => {

    const { medicines, email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return next(new Error(`invalid user`, { cause: 400 }));
    }

    
    const docUser = await userModel.findById(req.params.docId);
    const docEmail=docUser.email;
    const doctor = await doctorModel.findOne({email:docEmail});
    const docId=doctor._id;

    let now = new Date();
    req.body.dateFrom = new Date(req.body.dateFrom);
    req.body.dateTo = new Date(req.body.dateTo);
    /*if (req.body.dateFrom < now || req.body.dateTo < now) {
        return next(new Error(`please check the date again`, { cause: 400 }));
    }*/
    req.body.dateFrom = req.body.dateFrom.toLocaleDateString();
    req.body.dateTo = req.body.dateTo.toLocaleDateString();
    const prescription = await prescriptionModel.create({
        writtenFor: user._id,
        writtenBy: docId,
        dateFrom:req.body.dateFrom,
        dateTo:req.body.dateTo,
        medicines,
        diagnosis:req.body.diagnosis,
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


export const getPrescription = asyncHandler(async (req, res, next) => {
    const prescription = await prescriptionModel.findById(
         req.params.prescriptionId );
    if (!prescription) {
        return next(new Error(`this prescription not found `));
    }
    return res.status(200).json({ prescription });
}) 

export const getPrescriptionById = asyncHandler(async (req, res, next) => {
    const prescriptions = await prescriptionModel.find({ writtenFor:req.params.userId });
    return res.status(200).json({ prescriptions });
}) 

export const getPrescriptionByUser = asyncHandler(async (req, res, next) => {
    const user = await userModel.find({ email:req.body.email });
    return res.status(200).json(user);
    const prescriptions = await prescriptionModel.find({ writtenFor:user._id });
    return res.status(200).json({ prescriptions });
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
    return res.status(200).json({ prescriptions });
}) 