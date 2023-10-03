import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as categoryCont from './controller/category.controller.js';
import { validation } from "../../MiddleWare/validation.js";
import * as validators from "./category.validation.js"

import auth, { roles } from "../../MiddleWare/auth.middleware.js";
import { endPoint } from "./category.endPoint.js";

const router = Router();


router.post('/',auth(endPoint.create),fileUpload(fileValidation.image).single('image'),validation(validators.createCategory),categoryCont.createCategory);
router.put('/update/:categoryId',auth(endPoint.update),fileUpload(fileValidation.image).single('image'),validation(validators.updateCategory),categoryCont.updateCategory)
router.get('/:categoryId',auth(endPoint.get),validation(validators.getCategory),categoryCont.getCategory)
router.get('/',auth(Object.values(roles)),categoryCont.getAllCategory)
export default router;