"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.aboutRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const ctrl = __importStar(require("../controllers/about.controller"));
function isUploadImagePath(value) {
    return (value.startsWith("/uploads/") || /^https?:\/\/.+\/uploads\/.+/.test(value));
}
const putSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    education: zod_1.z.string().optional(),
    availability: zod_1.z.string().optional(),
    bio: zod_1.z.array(zod_1.z.string()).optional(),
    image: zod_1.z
        .string()
        .optional()
        .refine((value) => value == null || value === "" || isUploadImagePath(value), {
        message: "image must be an upload path or URL (use /api/upload first, then pass returned path)",
    }),
});
exports.aboutRouter = (0, express_1.Router)();
exports.aboutRouter.get("/about", ctrl.getAboutHandler);
exports.aboutRouter.put("/about", (0, validate_1.validateBody)(putSchema), ctrl.putAboutHandler);
//# sourceMappingURL=about.routes.js.map