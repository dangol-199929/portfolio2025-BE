/* eslint-disable @typescript-eslint/no-var-requires */

const { GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");

let s3Client: any = null;

function getBucket(): string {
  return process.env.S3_BUCKET?.trim() ?? "";
}

function getRegion(): string {
  return process.env.AWS_REGION?.trim() ?? "";
}

export function isS3Configured(): boolean {
  return getBucket().length > 0 && getRegion().length > 0;
}

function getS3Client(): any {
  if (!s3Client) {
    const region = getRegion();
    if (!region) {
      throw new Error("AWS_REGION is required when using S3 storage");
    }
    s3Client = new S3Client({ region });
  }
  return s3Client;
}

export async function uploadObject(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  const bucket = getBucket();
  if (!bucket) {
    throw new Error("S3_BUCKET is required when using S3 storage");
  }

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function getObject(key: string): Promise<any | null> {
  const bucket = getBucket();
  if (!bucket) return null;

  try {
    return await getS3Client().send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch {
    return null;
  }
}
