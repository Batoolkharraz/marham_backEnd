import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multer_cloud.js";
import * as searchCont from './controller/search.controller.js';

const router = Router();


router.post('/:id',searchCont.createSearchList);
router.get('/:id',searchCont.getSearchList);
export default router;