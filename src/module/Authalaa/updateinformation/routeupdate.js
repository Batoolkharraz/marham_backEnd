import { Router } from "express";
import { getAllUser, upinfo,numOfUser,numOfDoc } from './update.js';
import fileUpload, { fileValidation } from "../../../Services/multer_cloud.js";

const updaterouter=Router();
updaterouter.patch('/userinformation',fileUpload(fileValidation.image).single('image'),upinfo);
updaterouter.get('/getUser',getAllUser);
export default updaterouter;