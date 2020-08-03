const jwtSecret = require('../../common/config/env.config.js').jwt_secret;
const tokenExpirationInSeconds = 36000;
const jwt = require('jsonwebtoken');
let crypto = require('crypto');

export class JwtService{
    public static generateToken(permissionLevel: Number) {
        try {
            let refreshId = '123321' + jwtSecret;
            let salt = crypto.randomBytes(16).toString('base64');
            let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
            let expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + (tokenExpirationInSeconds / 3600));
            let token = jwt.sign({
                userId: '666',
                email: 'supertela@jwt.com',
                permissionLevel: permissionLevel,
                provider: 'email',
                name: 'SuperTela',
                refreshKey: salt
            }, jwtSecret);
            let b = Buffer.from(hash);
            b.toString('base64');
            return token;
        } catch (err) {
            throw err;
        }
    }
}