import { Router } from "express";
import { sentmail, updatepass } from './confirm.js';
const sentrouter=Router();
sentrouter.post('/confirmEmail',sentmail);
sentrouter.post('/User',updatepass);
export  default sentrouter;