import joi from "joi";
import { generalFeilds } from "../../MiddleWare/validation.js";

export const createDoctor=joi.object({
    name:joi.string().min(2).max(50).required(),
    file:generalFeilds.file.required(),
    description:joi.string().min(2).max(100).required(),
    email:generalFeilds.email,
    password:generalFeilds.password,
    cPassword:joi.string().valid(joi.ref('password')).required(),
    address:joi.string().min(2).max(50).required(),
    phone:joi.string().max(15).required(),
    category:joi.string().max(50).required(),
    status:joi.string().alphanum().valid('active','not_active'),
}).required();

export const updateDoctor=joi.object({
    name:joi.string().min(2).max(50),
    file:generalFeilds.file,
    description:joi.string().min(2).max(100),
    email:generalFeilds.email,
    address:joi.string().min(2).max(50),
    category:joi.string().max(50),
    phone:joi.string().max(15),
    status:joi.string().alphanum().valid('active','not_active'),
}).required();

export const getDoctor=joi.object({
    doctorId:generalFeilds.id,
}).required();
