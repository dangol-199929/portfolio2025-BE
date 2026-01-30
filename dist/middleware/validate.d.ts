import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare function validateBody(schema: ZodSchema): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map