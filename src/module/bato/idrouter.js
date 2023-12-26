import { Router } from "express";
import { getUser, sent,getUserByEmail } from "./email.js";
import { getusername } from './chat.js';
const idreturn=Router();
idreturn.post('/userinformation',sent);
idreturn.get('/getUser/:userId',getUser);
idreturn.post('/username',getusername);
idreturn.post('/getUserByEmail',getUserByEmail);
export  default idreturn;