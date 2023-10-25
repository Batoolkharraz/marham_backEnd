import { Router } from "express";
import { getUser, sent } from "./email.js";
const idreturn=Router();
idreturn.post('/userinformation',sent);
idreturn.get('/getUser',getUser);
export  default idreturn;