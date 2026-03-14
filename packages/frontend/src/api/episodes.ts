import api from './client';
import type { Episode } from './types';

export const listEpisodes = (projectId: number) =>
  api.get<Episode[]>(`/projects/${projectId}/episodes`);

export const getEpisode = (episodeId: number) =>
  api.get<Episode>(`/episodes/${episodeId}`);

export const createEpisode = (projectId: number, data: Partial<Episode>) =>
  api.post<Episode>(`/projects/${projectId}/episodes`, data);

export const updateEpisode = (episodeId: number, data: Partial<Episode>) =>
  api.put<Episode>(`/episodes/${episodeId}`, data);

export const deleteEpisode = (episodeId: number) =>
  api.delete(`/episodes/${episodeId}`);
