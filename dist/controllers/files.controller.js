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
exports.getUploadedFile = getUploadedFile;
exports.getResumeFile = getResumeFile;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const objectStorage_1 = require("../lib/objectStorage");
function getParamValue(value) {
    if (typeof value === "string")
        return value;
    if (Array.isArray(value))
        return value[0] ?? "";
    return "";
}
function safeBaseName(input) {
    return path.basename(input);
}
async function sendFromS3(key, res, next) {
    const data = await (0, objectStorage_1.getObject)(key);
    if (!data || !data.Body) {
        const err = new Error("File not found");
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    const body = data.Body;
    if (!body.transformToByteArray) {
        const err = new Error("Unable to read file");
        err.statusCode = 500;
        err.expose = true;
        return next(err);
    }
    const bytes = await body.transformToByteArray();
    if (data.ContentType) {
        res.setHeader("Content-Type", data.ContentType);
    }
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(Buffer.from(bytes));
}
function sendLocalFile(dir, fileName, res, next) {
    const filePath = path.join(process.cwd(), dir, fileName);
    if (!fs.existsSync(filePath)) {
        const err = new Error("File not found");
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    res.sendFile(filePath, (error) => {
        if (error) {
            next(error);
        }
    });
}
async function getUploadedFile(req, res, next) {
    const fileName = safeBaseName(getParamValue(req.params.fileName));
    if (!fileName) {
        const err = new Error("File name is required");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    if ((0, objectStorage_1.isS3Configured)()) {
        await sendFromS3(`uploads/${fileName}`, res, next);
        return;
    }
    sendLocalFile("uploads", fileName, res, next);
}
async function getResumeFile(req, res, next) {
    const fileName = safeBaseName(getParamValue(req.params.fileName));
    if (!fileName) {
        const err = new Error("File name is required");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    if ((0, objectStorage_1.isS3Configured)()) {
        await sendFromS3(`resume/${fileName}`, res, next);
        return;
    }
    sendLocalFile("resume", fileName, res, next);
}
//# sourceMappingURL=files.controller.js.map