export class PermissionMiddleware {
    public static MAX_PERMISSION = 4096 * 2;
    public static BASIC_PERMISSION = 1;

    constructor() {
    }

    required(level: any) {
        return (req: any, res: any, next: any) => {
            try {
                let userPermissionLevel = parseInt(req.jwt.permissionLevel);
                if (userPermissionLevel & Number.parseInt(level)) {
                    next();
                } else {
                    res.status(403).send({});
                }
            } catch (e) {
                console.log(e);
            }
        };
    }

    async onlySameUserOrAdminCanDoThisAction(req: any, res: any, next: any) {
        let userPermissionLevel = parseInt(req.jwt.permissionLevel);
        let userId = req.jwt.userId;
        if (req.params && req.params.userId && userId === req.params.userId) {
            return next();
        } else {
            if (userPermissionLevel & PermissionMiddleware.MAX_PERMISSION) {
                return next();
            } else {
                return res.status(403).send({});
            }
        }
    }

    async onlySameUserCanDoThisAction(req: any, res: any, next: any) {
        let userId = req.jwt.userId;
        if (req.params && req.params.userId && userId === req.params.userId) {
            return next();
        } else {
            return res.status(403).send({});
        }
    }

    async onlyAdminCanDoThisAction(req: any, res: any, next: any) {
        let userPermissionLevel = parseInt(req.jwt.permissionLevel);
        if (userPermissionLevel & PermissionMiddleware.MAX_PERMISSION) {
            return next();
        } else {
            return res.status(403).send({});
        }
    }
}