import joi from "joi";
import { generalFeilds } from "../../MiddleWare/validation.js";

export const updateMedicine=joi.object({
    Nname:joi.string().min(2).max(50),
    name:joi.string().min(2).max(50).required(),
    type:joi.string().min(2).max(100),
}).required();

export const getMedicine=joi.object({
    medicineId:generalFeilds.id,
}).required();

export const deleteMedicine=joi.object({
    medicineId:generalFeilds.id,
}).required();