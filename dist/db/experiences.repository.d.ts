import { Experience } from "../routes/experiences.routes";
export declare function getAllExperiences(): Promise<Experience[]>;
export declare function countExperiences(): Promise<number>;
export declare function insertExperience(experience: Experience): Promise<Experience>;
export declare function findExperienceById(id: string): Promise<Experience | undefined>;
export declare function updateExperience(experience: Experience): Promise<Experience>;
export declare function deleteExperience(id: string): Promise<void>;
//# sourceMappingURL=experiences.repository.d.ts.map