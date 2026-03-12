import api from './client';
import type { Panel, PanelVersion } from './types';

export const listPanels = (projectId: number, episodeId: number) =>
  api.get<Panel[]>(`/projects/${projectId}/episodes/${episodeId}/panels`);

export const getPanel = (projectId: number, episodeId: number, panelId: number) =>
  api.get<Panel>(`/projects/${projectId}/episodes/${episodeId}/panels/${panelId}`);

export const createPanel = (projectId: number, episodeId: number, data: Partial<Panel>) =>
  api.post<Panel>(`/projects/${projectId}/episodes/${episodeId}/panels`, data);

export const updatePanel = (projectId: number, episodeId: number, panelId: number, data: Partial<Panel>) =>
  api.put<Panel>(`/projects/${projectId}/episodes/${episodeId}/panels/${panelId}`, data);

export const deletePanel = (projectId: number, episodeId: number, panelId: number) =>
  api.delete(`/projects/${projectId}/episodes/${episodeId}/panels/${panelId}`);

export const listPanelVersions = (projectId: number, episodeId: number, panelId: number) =>
  api.get<PanelVersion[]>(`/projects/${projectId}/episodes/${episodeId}/panels/${panelId}/versions`);
