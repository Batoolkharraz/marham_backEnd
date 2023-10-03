import joi from "joi";
import { generalFeilds } from "../../MiddleWare/validation.js";

export const createCategory=joi.object({
    name:joi.string().min(2).max(24).required(),
    file:generalFeilds.file.required(),
}).required();

export const updateCategory=joi.object({
    categoryId:generalFeilds.id,
    name:joi.string().min(2).max(24),
    file:generalFeilds.file,
}).required();

export const getCategory=joi.object({
    categoryId:generalFeilds.id,
}).required();