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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
function postUpload(req, res, next) {
    const file = req.file;
    if (!file) {
        const err = new Error('No file uploaded');
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
        if (fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            }
            catch { /* ignore */ }
        }
        const err = new Error('Only image files are allowed');
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const filePath = `/uploads/${path.basename(file.path)}`;
    res.status(200).json({ path: filePath, success: true });
}
//# sourceMappingURL=upload.controller.js.map