import { Router } from "express";
import { getUser, sent } from "./email.js";
import { getusername } from './chat.js';
const idreturn=Router();
idreturn.post('/userinformation',sent);
idreturn.get('/getUser/:userId',getUser);
idreturn.post('/username',getusername);
export  default idreturn;