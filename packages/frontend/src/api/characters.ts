import api from './client';
import type { Character, AppearanceState } from './types';

export const listCharacters = (projectId: number) =>
  api.get<Character[]>(`/projects/${projectId}/characters`);

export const getCharacter = (projectId: number, characterId: number) =>
  api.get<Character>(`/projects/${projectId}/characters/${characterId}`);

export const createCharacter = (projectId: number, data: Partial<Character>) =>
  api.post<Character>(`/projects/${projectId}/characters`, data);

export const updateCharacter = (projectId: number, characterId: number, data: Partial<Character>) =>
  api.put<Character>(`/projects/${projectId}/characters/${characterId}`, data);

export const deleteCharacter = (projectId: number, characterId: number) =>
  api.delete(`/projects/${projectId}/characters/${characterId}`);

export const listAppearances = (projectId: number, characterId: number) =>
  api.get<AppearanceState[]>(`/projects/${projectId}/characters/${characterId}/appearances`);
