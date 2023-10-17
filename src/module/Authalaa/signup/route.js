import { Router } from "express";
import { signup } from './signup.js';
const signuprouter=Router();
signuprouter.post("/user",signup);
export default signuprouter;