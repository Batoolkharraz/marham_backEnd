import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as categoryCont from './controller/category.controller.js';
import { validation } from "../../MiddleWare/validation.js";
import * as validators from "./category.validation.js"

import auth, { roles } from "../../MiddleWare/auth.middleware.js";
import { endPoint } from "./category.endPoint.js";

const router = Router();


router.post('/',auth(endPoint.create),fileUpload(fileValidation.image).single('image'),validation(validators.createCategory),categoryCont.createCategory);
router.patch('/update',auth(endPoint.update),fileUpload(fileValidation.image).single('image'),validation(validators.updateCategory),categoryCont.updateCategory)
router.get('/',categoryCont.getAllCategory);
router.delete('/',categoryCont.deleteCategory);
export default router;