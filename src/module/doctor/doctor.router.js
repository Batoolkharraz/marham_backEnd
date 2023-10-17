import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as doctorCont from './controller/doctor.controller.js';
import { validation } from "../../MiddleWare/validation.js";
import * as validators from "./doctor.validation.js"

import auth, { roles } from "../../MiddleWare/auth.middleware.js";
import { endPoint } from "./doctor.endPoint.js";

const router = Router();


router.post('/',auth(endPoint.create),fileUpload(fileValidation.image).single('image'),validation(validators.createDoctor),doctorCont.createDoctor);
router.patch('/update',auth(endPoint.update),fileUpload(fileValidation.image).single('image'),validation(validators.updateDoctor),doctorCont.updateDoctor)
router.get('/',doctorCont.getAllDoctor);
router.get('/:doctorId',doctorCont.getDoctor);
router.get('/category/:categoryId',doctorCont.getDoctorByCat);
router.delete('/',doctorCont.deleteDoctor);
export default router;