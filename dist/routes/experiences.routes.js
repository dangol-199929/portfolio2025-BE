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
exports.experiencesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const ctrl = __importStar(require("../controllers/experiences.controller"));
const postSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    period: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    side: zod_1.z.enum(["left", "right"]).optional(),
});
const putSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    period: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    side: zod_1.z.enum(["left", "right"]).optional(),
});
exports.experiencesRouter = (0, express_1.Router)();
exports.experiencesRouter.get("/experiences", ctrl.getAll);
exports.experiencesRouter.post("/experiences", (0, validate_1.validateBody)(postSchema), ctrl.createOne);
exports.experiencesRouter.put("/experiences", (0, validate_1.validateBody)(putSchema), ctrl.updateOne);
exports.experiencesRouter.delete("/experiences", ctrl.deleteOne);
//# sourceMappingURL=experiences.routes.js.map