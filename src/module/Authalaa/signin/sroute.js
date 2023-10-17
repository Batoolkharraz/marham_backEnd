import { Router } from "express";
import { signin } from "./signin.js";
const signinsrouter=Router();
signinsrouter.post('/user',signin);
export default signinsrouter;