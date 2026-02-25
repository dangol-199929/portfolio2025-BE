export declare function isS3Configured(): boolean;
export declare function getPublicPath(key: string): string;
export declare function uploadObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
}): Promise<void>;
export declare function getObject(key: string): Promise<any | null>;
//# sourceMappingURL=objectStorage.d.ts.map