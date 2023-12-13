import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as doctorCont from './controller/doctor.controller.js';
import { validation } from "../../MiddleWare/validation.js";
import * as validators from "./doctor.validation.js"

import auth, { roles } from "../../MiddleWare/auth.middleware.js";
import { endPoint } from "./doctor.endPoint.js";

const router = Router();


router.post('/',fileUpload(fileValidation.image).single('image'),doctorCont.createDoctor);
router.patch('/update',fileUpload(fileValidation.image).single('image'),doctorCont.updateDoctor)
router.get('/',doctorCont.getAllDoctor);
router.get('/:doctorId',doctorCont.getDoctor);
router.get('/Usersearch/:userId',doctorCont.getDoctorByUserSearch);
router.get('/doctorByCategory/:categoryId',doctorCont.getDoctorByCat);
router.delete('/',doctorCont.deleteDoctor);
router.get('/find/:docId',doctorCont.getDoctorByEmail);
router.get('/findId/:docId',doctorCont.getDoctorId);
export default router;