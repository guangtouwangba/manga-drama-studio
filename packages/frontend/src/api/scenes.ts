import api from './client';
import type { Scene } from './types';

export const listScenes = (projectId: number) =>
  api.get<Scene[]>(`/projects/${projectId}/scenes`);

export const getScene = (projectId: number, sceneId: number) =>
  api.get<Scene>(`/projects/${projectId}/scenes/${sceneId}`);

export const createScene = (projectId: number, data: Partial<Scene>) =>
  api.post<Scene>(`/projects/${projectId}/scenes`, data);

export const updateScene = (projectId: number, sceneId: number, data: Partial<Scene>) =>
  api.put<Scene>(`/projects/${projectId}/scenes/${sceneId}`, data);

export const deleteScene = (projectId: number, sceneId: number) =>
  api.delete(`/projects/${projectId}/scenes/${sceneId}`);
