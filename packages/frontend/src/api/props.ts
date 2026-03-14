import api from './client';

export const listProps = (projectId: number) =>
  api.get(`/projects/${projectId}/props`);

export const createProp = (projectId: number, data: { name: string; category: string; description?: string }) =>
  api.post(`/projects/${projectId}/props`, data);
