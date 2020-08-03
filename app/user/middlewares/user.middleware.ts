import express from 'express';
import {UserService} from '../services/user.service';
import {SecurePass} from 'argon2-pass';

export class UserMiddleware {

    private static instance: UserMiddleware;

    static getInstance() {
        if (!UserMiddleware.instance) {
            UserMiddleware.instance = new UserMiddleware();
        }
        return UserMiddleware.instance;
    }

    validateRequiredUserFields(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.body) {
            console.debug(`Missing required fields: [name, email, password]`)
            res.status(400).send({error: `Missing required fields: [name, email, password]`});
            return
        }
        let missingFields = Array<string>()
        if (!req.body.name) {
            missingFields.push("name")
        }
        if (!req.body.email) {
            missingFields.push("email")
        }
        if (!req.body.password) {
            missingFields.push("password")
        }
        if (missingFields.length > 0) {
            console.debug(`Missing required fields: [${missingFields.join(', ')}]`)
            res.status(400).send({error: `Missing required fields: [${missingFields.join(', ')}]`});
            return;
        }
        next();
    }

    requiredEmailField(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.body) {
            console.debug(`Missing required field: [email]`)
            res.status(400).send({error: `Missing required fields: [email]`});
            return
        }
        if (!req.body.email) {
            console.debug(`Missing required field: [email]`)
            res.status(400).send({error: `Missing required field: [email]`});
            return;
        }
        next();
    }

    validateEmailFormat(req: express.Request, res: express.Response, next: express.NextFunction) {
        const regexp = new RegExp(/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i);

        if (!regexp.test(req.body.email)) {
            console.debug(`Isn't valid email format: ${req.body.email}`)
            res.status(400).send({error: `Isn't valid email format: ${req.body.email}`});
            return;
        }
        next();
    }

    async validateIfUserExists(req: express.Request, res: express.Response, next: express.NextFunction) {
        const userService = UserService.getInstance();
        const user = await userService.getByEmail(req.body.email);
        if (user) {
            console.debug(`User email already exists`)
            res.status(400).send({error: `User email already exists`});
        } else {
            next();
        }
    }

    async checkValidUser(req: express.Request, res: express.Response, next: express.NextFunction) {
        const userService = UserService.getInstance();
        const user = await userService.readById(req.params.userId);
        if (user) {
            next();
        } else {
            res.status(404).send({error: `User ${req.params.userId} not found`});
        }
    }

    async extractUserId(req: express.Request, res: express.Response, next: express.NextFunction) {
        req.body._id = req.params.userId;
        next();
    }

    async passwordAndEmailCantChange(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.body) {
            next()
            return
        }
        if (req.body.password || req.body.email) {
            const message = `You can't change your email or password with this function: [email or password]`
            console.debug(message)
            res.status(400).send({error: message});
            return;
        }
        next();
    }
}