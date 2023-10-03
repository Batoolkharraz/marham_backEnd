import joi from "joi";
import { generalFeilds } from "../../MiddleWare/validation.js";

export const createCategory=joi.object({
    name:joi.string().min(2).max(50).required(),
    file:generalFeilds.file.required(),
    description:joi.string().min(2).max(100).required(),
}).required();

export const updateCategory=joi.object({
    Nname:joi.string().min(2).max(24),
    name:joi.string().min(2).max(24).required(),
    file:generalFeilds.file,
    description:joi.string().min(2).max(100),
}).required();

export const getCategory=joi.object({
    categoryId:generalFeilds.id,
}).required();