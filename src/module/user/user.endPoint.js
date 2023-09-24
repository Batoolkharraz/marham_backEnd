import { roles } from "../../MiddleWare/auth.middleware.js";

export const endPoint={
    updateStatus:[roles.superAdmin],
    addUser:[roles.superAdmin,roles.admin],
    deleteUser:[roles.superAdmin,roles.admin],
    updateUser:[roles.superAdmin,roles.admin]
}