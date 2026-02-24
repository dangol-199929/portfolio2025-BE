import { Project } from "../routes/projects.routes";
export declare function getAllProjects(): Promise<Project[]>;
export declare function findProjectById(id: string): Promise<Project | undefined>;
export declare function insertProject(project: Project): Promise<Project>;
export declare function updateProject(project: Project): Promise<Project>;
export declare function deleteProject(id: string): Promise<void>;
//# sourceMappingURL=projects.repository.d.ts.map