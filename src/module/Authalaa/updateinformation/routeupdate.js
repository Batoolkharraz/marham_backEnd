import { Router } from "express";
import { upinfo } from './update.js';
import fileUpload, { fileValidation } from "../../../Services/multer_cloud.js";

const updaterouter=Router();
updaterouter.patch('/userinformation',fileUpload(fileValidation.image).single('image'),upinfo);
export default updaterouter;