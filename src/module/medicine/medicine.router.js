import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as medicineCont from './controller/medicine.controller.js';
import { validation } from "../../MiddleWare/validation.js";
import * as validators from "./medicine.validation.js"

import auth, { roles } from "../../MiddleWare/auth.middleware.js";
import { endPoint } from "./medicine.endPoint.js";

const router = Router();


router.post('/',auth(endPoint.create),validation(validators.createMedicine),medicineCont.createMedicine);
router.patch('/update',auth(endPoint.update),validation(validators.updateMedicine),medicineCont.updateMedicine)
router.get('/',medicineCont.getAllMedicine);
router.get('/:medicineId',validation(validators.getMedicine),medicineCont.getMedicine);
router.delete('/:medicineId',validation(validators.deleteMedicine),medicineCont.deleteMedicine);
export default router;