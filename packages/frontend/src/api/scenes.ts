import api from './client';
import type { Scene, SceneView } from './types';

export const listScenes = (projectId: number) =>
  api.get<Scene[]>(`/projects/${projectId}/scenes`);

export const getScene = (sceneId: number) =>
  api.get<Scene>(`/scenes/${sceneId}`);

export const createScene = (projectId: number, data: Partial<Scene>) =>
  api.post<Scene>(`/projects/${projectId}/scenes`, data);

export const updateScene = (sceneId: number, data: Partial<Scene>) =>
  api.put<Scene>(`/scenes/${sceneId}`, data);

export const deleteScene = (sceneId: number) =>
  api.delete(`/scenes/${sceneId}`);

export const listViews = (sceneId: number) =>
  api.get<SceneView[]>(`/scenes/${sceneId}/views`);

export const createView = (sceneId: number, data: Partial<SceneView>) =>
  api.post<SceneView>(`/scenes/${sceneId}/views`, data);
