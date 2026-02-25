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
exports.postUpload = postUpload;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const objectStorage_1 = require("../lib/objectStorage");
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
function buildImageName(originalName) {
    const ext = path.extname(originalName) || ".png";
    return `project-${Date.now()}${ext.toLowerCase()}`;
}
async function postUpload(req, res, next) {
    const file = req.file;
    if (!file) {
        const err = new Error("No file uploaded");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
        const err = new Error("Only image files are allowed");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const fileName = buildImageName(file.originalname);
    const relativePath = `/uploads/${fileName}`;
    try {
        if ((0, objectStorage_1.isS3Configured)()) {
            await (0, objectStorage_1.uploadObject)({
                key: `uploads/${fileName}`,
                body: file.buffer,
                contentType: file.mimetype,
            });
        }
        else {
            const uploadsDir = path.join(process.cwd(), "uploads");
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            fs.writeFileSync(path.join(uploadsDir, fileName), file.buffer);
        }
        const pathForClient = (0, objectStorage_1.isS3Configured)()
            ? (0, objectStorage_1.getPublicPath)(`uploads/${fileName}`)
            : relativePath;
        res.status(200).json({ path: pathForClient, success: true });
    }
    catch {
        const err = new Error("Failed to upload image");
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
//# sourceMappingURL=upload.controller.js.map