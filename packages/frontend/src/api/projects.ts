import api from './client';
import type { Project } from './types';

export const listProjects = () => api.get<Project[]>('/projects');
export const getProject = (id: number) => api.get<Project>(`/projects/${id}`);
export const createProject = (data: Partial<Project>) => api.post<Project>('/projects', data);
export const updateProject = (id: number, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data);
export const deleteProject = (id: number) => api.delete(`/projects/${id}`);

export const getEntityMap = (projectId: number) =>
  api.get<{
    characters: { id: number; name: string; name_en: string }[];
    scenes: { id: number; name: string; name_en: string }[];
    props: { id: number; name: string; name_en: string }[];
  }>(`/projects/${projectId}/entity-map`);
