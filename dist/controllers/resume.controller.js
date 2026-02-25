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
exports.getResume = getResume;
exports.postResume = postResume;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const objectStorage_1 = require("../lib/objectStorage");
const settings_repository_1 = require("../db/settings.repository");
const logger_1 = require("../utils/logger");
const ALLOWED_MIME = "application/pdf";
function buildResumeFileName() {
    return `resume-${Date.now()}.pdf`;
}
async function getResume(_req, res, _next) {
    try {
        const resumePath = await (0, settings_repository_1.getResumePath)();
        res.status(200).json({ resumePath });
    }
    catch {
        res.status(200).json({ resumePath: "/resume/Resume.pdf" });
    }
}
async function postResume(req, res, next) {
    const file = req.file;
    if (!file) {
        const err = new Error("No file uploaded");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    if (file.mimetype !== ALLOWED_MIME) {
        const err = new Error("Only PDF files are allowed");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const fileName = buildResumeFileName();
    const resumePath = `/resume/${fileName}`;
    try {
        if ((0, objectStorage_1.isS3Configured)()) {
            await (0, objectStorage_1.uploadObject)({
                key: `resume/${fileName}`,
                body: file.buffer,
                contentType: file.mimetype,
            });
        }
        else {
            const resumeDir = path.join(process.cwd(), "resume");
            if (!fs.existsSync(resumeDir)) {
                fs.mkdirSync(resumeDir, { recursive: true });
            }
            fs.writeFileSync(path.join(resumeDir, fileName), file.buffer);
        }
        await (0, settings_repository_1.setResumePath)(resumePath);
        const pathForClient = (0, objectStorage_1.isS3Configured)()
            ? (0, objectStorage_1.getPublicPath)(`resume/${fileName}`)
            : resumePath;
        res.status(200).json({ resumePath: pathForClient, success: true });
    }
    catch (e) {
        const cause = e instanceof Error ? e : new Error(String(e));
        logger_1.logger.error("Resume upload failed", {
            message: cause.message,
            stack: cause.stack,
        });
        const err = new Error(process.env.NODE_ENV === "production"
            ? "Failed to upload resume"
            : `Failed to upload resume: ${cause.message}`);
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
//# sourceMappingURL=resume.controller.js.map