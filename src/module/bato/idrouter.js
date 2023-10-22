import { Router } from "express";
import { sent } from "./email.js";
const idreturn=Router();
idreturn.post('/userinformation',sent);
export  default idreturn;