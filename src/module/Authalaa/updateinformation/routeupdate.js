import { Router } from "express";
import { upinfo } from './update.js';
const updaterouter=Router();
updaterouter.patch('/userinformation',upinfo);
export default updaterouter;