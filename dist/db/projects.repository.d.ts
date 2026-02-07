import { Project } from "../routes/projects.routes";
export declare function getAllProjects(): Project[];
export declare function findProjectById(id: string): Project | undefined;
export declare function insertProject(project: Project): Project;
export declare function updateProject(project: Project): Project;
export declare function deleteProject(id: string): void;
//# sourceMappingURL=projects.repository.d.ts.map