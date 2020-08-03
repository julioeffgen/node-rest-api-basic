import express from 'express';
import {UserService} from '../services/user.service';
import {SecurePass} from "argon2-pass";

async function passwordHash(pwd: string) {
    if (pwd) {
        const sp = new SecurePass();
        const password = Buffer.from(pwd);
        return (await sp.hashPassword(password)).toString('utf-8');
    }
    return ''
}

export class UserController {

    async listUsers(req: express.Request, res: express.Response) {
        const usersService = UserService.getInstance();
        const users = await usersService.list(100, 0);
        res.status(200).send(users);
    }

    async getUserById(req: express.Request, res: express.Response) {
        const usersService = UserService.getInstance();
        const user = await usersService.readById(req.params.userId);
        res.status(200).send(user);
    }

    async createUser(req: express.Request, res: express.Response) {
        const usersService = UserService.getInstance();
        req.body.password = await passwordHash(req.body.password)
        const userId = await usersService.create(req.body);
        res.status(201).send({ _id: userId });
    }

    async forgotPassword(req: express.Request, res: express.Response) {
        const usersService = UserService.getInstance();
        const pwd = Math.random()
            .toString(36)
            .slice(-8);
        req.body.password = await passwordHash(pwd)
        const message = await usersService.forgotPassword(req.body);
        if (message) {
            //FIXME: Send email with new password
            res.status(200).send({ message: message });
        } else {
            res.status(400).send({ message: `User not found with: ${req.body.email}` });
        }
    }

    async patch(req: express.Request, res: express.Response) {
        const usersService = UserService.getInstance();
        await usersService.patchById(req.body);
        res.status(204).send(``);
    }

    async put(req: express.Request, res: express.Response) {
        const usersService = UserService.getInstance();
        await usersService.updateById(req.body);
        res.status(204).send(``);
    }

    async changePassword(req: express.Request, res: express.Response) {
        const usersService = UserService.getInstance();
        req.body.password = await passwordHash(req.body.password)
        await usersService.updateById(req.body);
        res.status(204).send(``);
    }

    async removeUser(req: express.Request, res: express.Response) {
        const usersService = UserService.getInstance();
        await usersService.deleteById(req.params.userId);
        res.status(204).send(``);
    }

    async clearUsers(req: express.Request, res: express.Response) {
        const usersService = UserService.getInstance();
        await usersService.removeAll();
        res.status(204).send(``);
    }
}