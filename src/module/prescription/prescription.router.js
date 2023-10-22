import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as prescriptionCont from './controller/prescription.controller.js';
import { validation } from "../../MiddleWare/validation.js";
import * as validators from "./prescription.validation.js"

import auth, { roles } from "../../MiddleWare/auth.middleware.js";
import { endPoint } from "./prescription.endPoint.js";

const router = Router();


router.post('/',prescriptionCont.createPrescription);
router.get('/:prescriptionId',prescriptionCont.getPrescription);
router.get('/forUser/:userId',prescriptionCont.getPrescriptionByUser);
router.patch('/',prescriptionCont.changeState);
/*
router.patch('/update',auth(endPoint.update),validation(validators.updateMedicine),medicineCont.updateMedicine)

router.get('/:medicineId',validation(validators.getMedicine),medicineCont.getMedicine);
router.delete('/:medicineId',validation(validators.deleteMedicine),medicineCont.deleteMedicine);*/
export default router;