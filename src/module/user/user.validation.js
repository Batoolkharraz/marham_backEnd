import joi from "joi";
import { generalFeilds } from "../../MiddleWare/validation.js";

export const profilePic={
    file:generalFeilds.file.required(),
}


export const updatePassword={
    body:joi.object({
        oldPassword:generalFeilds.password,
        newPassword:generalFeilds.password.invalid(joi.ref('oldPassword')),
        cPassword:joi.string().valid(joi.ref('newPassword')).required(),
    }).required(),
}


export const shareProfile ={
    params:joi.object({
        id:generalFeilds.id,
    }).required()
}

export const updateStatus ={
    params:joi.object({
        id:generalFeilds.id,
    }).required()
}