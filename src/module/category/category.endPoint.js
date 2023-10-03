import { roles } from "../../MiddleWare/auth.middleware.js";

export const endPoint={
    create:[roles.admin],
    update:[roles.admin],
    get:[roles.user]
}