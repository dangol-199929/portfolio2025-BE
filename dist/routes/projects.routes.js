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
exports.projectsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const ctrl = __importStar(require("../controllers/projects.controller"));
const postSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    fullDescription: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    liveUrl: zod_1.z.string().optional(),
    githubUrl: zod_1.z.string().optional(),
    metrics: zod_1.z.array(zod_1.z.string()).optional(),
});
const putSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    fullDescription: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    liveUrl: zod_1.z.string().optional(),
    githubUrl: zod_1.z.string().optional(),
    metrics: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.projectsRouter = (0, express_1.Router)();
exports.projectsRouter.get("/projects", ctrl.getAll);
exports.projectsRouter.post("/projects", (0, validate_1.validateBody)(postSchema), ctrl.createOne);
exports.projectsRouter.put("/projects", (0, validate_1.validateBody)(putSchema), ctrl.updateOne);
exports.projectsRouter.delete("/projects", ctrl.deleteOne);
//# sourceMappingURL=projects.routes.js.map