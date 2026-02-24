"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isS3Configured = isS3Configured;
exports.uploadObject = uploadObject;
exports.getObject = getObject;
const { GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
let s3Client = null;
function getBucket() {
    return process.env.S3_BUCKET?.trim() ?? "";
}
function getRegion() {
    return process.env.AWS_REGION?.trim() ?? "";
}
function isS3Configured() {
    return getBucket().length > 0 && getRegion().length > 0;
}
function getS3Client() {
    if (!s3Client) {
        const region = getRegion();
        if (!region) {
            throw new Error("AWS_REGION is required when using S3 storage");
        }
        s3Client = new S3Client({ region });
    }
    return s3Client;
}
async function uploadObject(params) {
    const bucket = getBucket();
    if (!bucket) {
        throw new Error("S3_BUCKET is required when using S3 storage");
    }
    await getS3Client().send(new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        CacheControl: "public, max-age=31536000, immutable",
    }));
}
async function getObject(key) {
    const bucket = getBucket();
    if (!bucket)
        return null;
    try {
        return await getS3Client().send(new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=objectStorage.js.map