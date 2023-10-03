import { roles } from "../../MiddleWare/auth.middleware.js";

export const endPoint={
    create:[roles.admin,roles.user,roles.superAdmin],
    update:[roles.admin,roles.user,roles.superAdmin],
    get:[roles.admin,roles.user,roles.superAdmin],
    delete:[roles.admin,roles.user,roles.superAdmin],
}