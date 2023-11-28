import { Router } from "express";
import { getUser, sent } from "./email.js";
const idreturn=Router();
idreturn.post('/userinformation',sent);
idreturn.get('/getUser/:userId',getUser);
idreturn.get('/username',getusername);
export  default idreturn;