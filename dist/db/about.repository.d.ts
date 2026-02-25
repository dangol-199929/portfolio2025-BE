export type AboutRecord = {
    name: string;
    email: string;
    education: string;
    availability: string;
    bio: string[];
    image: string;
};
export declare function getAbout(): Promise<AboutRecord>;
export declare function updateAbout(data: Partial<AboutRecord>): Promise<AboutRecord>;
//# sourceMappingURL=about.repository.d.ts.map