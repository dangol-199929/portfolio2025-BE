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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResume = getResume;
exports.postResume = postResume;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const db_1 = __importDefault(require("../db"));
const ALLOWED_MIME = 'application/pdf';
function getResume(_req, res, next) {
    try {
        const row = db_1.default.prepare('SELECT resumePath FROM settings WHERE id = 1').get();
        const resumePath = row?.resumePath ?? '/resume/Resume.pdf';
        res.status(200).json({ resumePath });
    }
    catch {
        res.status(200).json({ resumePath: '/resume/Resume.pdf' });
    }
}
function postResume(req, res, next) {
    const file = req.file;
    if (!file) {
        const err = new Error('No file uploaded');
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    if (file.mimetype !== ALLOWED_MIME) {
        if (fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            }
            catch { /* ignore */ }
        }
        const err = new Error('Only PDF files are allowed');
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const resumePath = `/resume/${path.basename(file.path)}`;
    try {
        db_1.default.prepare('UPDATE settings SET resumePath = ? WHERE id = 1').run(resumePath);
        res.status(200).json({ resumePath, success: true });
    }
    catch {
        const err = new Error('Failed to upload resume');
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
//# sourceMappingURL=resume.controller.js.map