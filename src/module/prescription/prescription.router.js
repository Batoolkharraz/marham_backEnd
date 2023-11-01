import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as prescriptionCont from './controller/prescription.controller.js';
import { validation } from "../../MiddleWare/validation.js";
import * as validators from "./prescription.validation.js"

import auth, { roles } from "../../MiddleWare/auth.middleware.js";
import { endPoint } from "./prescription.endPoint.js";

const router = Router();


router.post('/:docId',prescriptionCont.createPrescription);
router.get('/:prescriptionId',prescriptionCont.getPrescription);
router.get('/',prescriptionCont.getPrescriptionByUser);
router.get('/forUser/:userId',prescriptionCont.getPrescriptionById);
router.patch('/',prescriptionCont.changeState);

export default router;