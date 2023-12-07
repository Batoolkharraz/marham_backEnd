import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as adminCont from './controller/admin.controller.js';

const router = Router();


router.post('/',adminCont.doctorSignUp);

export default router;