import api from './client';
import type { Episode } from './types';

export const listEpisodes = (projectId: number) =>
  api.get<Episode[]>(`/projects/${projectId}/episodes`);

export const getEpisode = (projectId: number, episodeId: number) =>
  api.get<Episode>(`/projects/${projectId}/episodes/${episodeId}`);

export const createEpisode = (projectId: number, data: Partial<Episode>) =>
  api.post<Episode>(`/projects/${projectId}/episodes`, data);

export const updateEpisode = (projectId: number, episodeId: number, data: Partial<Episode>) =>
  api.put<Episode>(`/projects/${projectId}/episodes/${episodeId}`, data);

export const deleteEpisode = (projectId: number, episodeId: number) =>
  api.delete(`/projects/${projectId}/episodes/${episodeId}`);
