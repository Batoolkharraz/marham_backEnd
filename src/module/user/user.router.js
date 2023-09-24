import { Router } from "express";
import * as userCont from './controller/user.controller.js';
import auth from '../../MiddleWare/auth.middleware.js';
import fileUpload, { HME, fileValidation } from "../../Services/multer_cloud.js";
import { validation } from "../../MiddleWare/validation.js";
import * as validators from  './user.validation.js';
import { endPoint } from "./user.endPoint.js";

const router = Router();


router.patch('/updatePassword',auth,validation(validators.updatePassword),userCont.updatePassword);
router.get('/:id/profile',validation(validators.shareProfile),userCont.getProfile);


router.patch('/updateStatus/:id',auth(endPoint.updateStatus),userCont.updateStatus);
router.post('/addUser',auth(endPoint.addUser),userCont.addUser);
router.delete('/deleteUser/:id',auth(endPoint.deleteUser),userCont.deleteUser);
router.patch('/updateUser/:id',auth(endPoint.updateUser),userCont.updateUser);


router.post('/addUser',auth(endPoint.addUser),userCont.addUser);

export default router;