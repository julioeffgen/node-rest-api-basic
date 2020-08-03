import {CRUD} from '../../common/interfaces/crud.interface';
import {UsersDao} from '../dao/user.dao';
import SecurePass from "argon2-pass";

export class UserService implements CRUD {

    private static instance: UserService;

    constructor() {
    }

    static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    create(resource: any) {
        resource.permissionLevel = 1 + 2 + 4 + 8;
        return UsersDao.getInstance().addUser(resource);
    }

    async forgotPassword(resource: any) {
        const user = await UsersDao.getInstance().findUserByEmail(resource.email);
        if (!user) {
            return null
        }
        resource._id = user._id
        await UsersDao.getInstance().patchUser(resource)
        return `New password was sent to ${resource.email}`;
    }

    deleteById(resourceId: any) {
        return UsersDao.getInstance().removeUserById(resourceId);
    };

    list(limit: number, page: number) {
        return UsersDao.getInstance().listAllUsers(limit, page);
    };

    patchById(resource: any) {
        return UsersDao.getInstance().patchUser(resource)
    };

    readById(resourceId: any) {
        return UsersDao.getInstance().findUserById(resourceId);
    };

    updateById(resource: any) {
        return UsersDao.getInstance().patchUser(resource);
    };

    removeAll() {
        return UsersDao.getInstance().removeAll();
    };

    async getByEmail(email: string) {
        return UsersDao.getInstance().findUserByEmail(email);
    }
}
