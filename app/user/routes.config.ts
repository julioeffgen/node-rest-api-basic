import { AppRoutesConfig, configureRoutes } from '../common/routes.config';
import { UserController } from './controllers/user.controller';
import { UserMiddleware } from './middlewares/user.middleware';
import { PermissionMiddleware } from '../auth/middlewares/permission.middleware';
import { JwtMiddleware } from '../auth/middlewares/jwt.middleware';
import express from 'express';

export class UserRoutes extends AppRoutesConfig implements configureRoutes {

    constructor(app: express.Application) {
        super(app, 'UserRoutes');
        this.configureRoutes();
    }

    configureRoutes() {
        const userController = new UserController();
        const userMiddleware = UserMiddleware.getInstance();
        const jwtMiddleware = JwtMiddleware.getInstance();
        const permissionMiddleware = new PermissionMiddleware();

        this.app.get(`/v1/users`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.onlyAdminCanDoThisAction,
            userController.listUsers
        ]);

        this.app.post(`/v1/users`, [
            userMiddleware.validateRequiredUserFields,
            userMiddleware.validateEmailFormat,
            userMiddleware.validateIfUserExists,
            userController.createUser
        ]);

        this.app.post(`/v1/forgot`, [
            userMiddleware.requiredEmailField,
            userMiddleware.validateEmailFormat,
            userController.forgotPassword
        ]);

        this.app.put(`/v1/users/:userId`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.required(PermissionMiddleware.BASIC_PERMISSION),
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
            userMiddleware.checkValidUser,
            userMiddleware.passwordAndEmailCantChange,
            userMiddleware.extractUserId,
            userController.put
        ]);

        this.app.put(`/v1/users/:userId/password/change`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.required(PermissionMiddleware.BASIC_PERMISSION),
            userMiddleware.checkValidUser,
            permissionMiddleware.onlySameUserCanDoThisAction,
            userMiddleware.extractUserId,
            userController.changePassword
        ]);

        this.app.patch(`/v1/users/:userId`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.required(PermissionMiddleware.BASIC_PERMISSION),
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
            userMiddleware.checkValidUser,
            userMiddleware.passwordAndEmailCantChange,
            userMiddleware.extractUserId,
            userController.patch
        ]);

        this.app.delete(`/v1/users/:userId`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.required(PermissionMiddleware.BASIC_PERMISSION),
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
            userMiddleware.checkValidUser,
            userMiddleware.extractUserId,
            userController.removeUser
        ]);

        this.app.delete(`/v1/users`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.required(PermissionMiddleware.BASIC_PERMISSION),
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
            userController.clearUsers
        ]);

        this.app.get(`/v1/users/:userId`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.required(PermissionMiddleware.BASIC_PERMISSION),
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
            userMiddleware.checkValidUser,
            userMiddleware.extractUserId,
            userController.getUserById
        ]);
    }
}