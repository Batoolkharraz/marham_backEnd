import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as categoryCont from './controller/category.controller.js';
import { validation } from "../../MiddleWare/validation.js";
import * as validators from "./category.validation.js"

import auth, { roles } from "../../MiddleWare/auth.middleware.js";
import { endPoint } from "./category.endPoint.js";

const router = Router();


router.post('/',fileUpload(fileValidation.image).single('image'),categoryCont.createCategory);
router.patch('/update/:id',fileUpload(fileValidation.image).single('image'),categoryCont.updateCategory)
router.get('/',categoryCont.getAllCategory);
router.get('/:categoryId',categoryCont.getCategory);
router.get('/getNumDoctor/123',categoryCont.numDocOfCategory);
router.delete('/:id',categoryCont.deleteCategory);
export default router;