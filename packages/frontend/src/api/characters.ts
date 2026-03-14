import api from './client';
import type { Character, CharacterAppearance } from './types';

export const listCharacters = (projectId: number) =>
  api.get<Character[]>(`/projects/${projectId}/characters`);

export const getCharacter = (characterId: number) =>
  api.get<Character>(`/characters/${characterId}`);

export const createCharacter = (projectId: number, data: Partial<Character>) =>
  api.post<Character>(`/projects/${projectId}/characters`, data);

export const updateCharacter = (characterId: number, data: Partial<Character>) =>
  api.put<Character>(`/characters/${characterId}`, data);

export const deleteCharacter = (characterId: number) =>
  api.delete(`/characters/${characterId}`);

export const listAppearances = (characterId: number) =>
  api.get<CharacterAppearance[]>(`/characters/${characterId}/appearances`);

export const createAppearance = (characterId: number, data: Partial<CharacterAppearance>) =>
  api.post<CharacterAppearance>(`/characters/${characterId}/appearances`, data);

export const updateAppearance = (characterId: number, appearanceId: number, data: Partial<CharacterAppearance>) =>
  api.put<CharacterAppearance>(`/characters/${characterId}/appearances/${appearanceId}`, data);

export const deleteAppearance = (characterId: number, appearanceId: number) =>
  api.delete(`/characters/${characterId}/appearances/${appearanceId}`);
