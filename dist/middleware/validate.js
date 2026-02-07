"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const zod_1 = require("zod");
function validateBody(schema) {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (e) {
            if (e instanceof zod_1.ZodError) {
                const msg = e.issues.map((err) => err.message).join("; ") ||
                    "Validation failed";
                const err = new Error(msg);
                err.statusCode = 400;
                err.expose = true;
                next(err);
            }
            else {
                next(e);
            }
        }
    };
}
//# sourceMappingURL=validate.js.map