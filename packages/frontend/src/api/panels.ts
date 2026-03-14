import api from './client';
import type { Panel } from './types';

export const listPanels = (episodeId: number) =>
  api.get<Panel[]>(`/episodes/${episodeId}/panels`);

export const getPanel = (panelId: number) =>
  api.get<Panel>(`/panels/${panelId}`);

export const createPanel = (episodeId: number, data: Partial<Panel>) =>
  api.post<Panel>(`/episodes/${episodeId}/panels`, data);

export const updatePanel = (panelId: number, data: Partial<Panel>) =>
  api.put<Panel>(`/panels/${panelId}`, data);

export const deletePanel = (panelId: number) =>
  api.delete(`/panels/${panelId}`);

export const insertPanelAfter = (panelId: number, data: Partial<Panel>) =>
  api.post<Panel>(`/panels/${panelId}/insert-after`, data);
