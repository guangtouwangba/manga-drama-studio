import api from './client';

interface GenerateParams {
  model_override?: string;
}

export function generateImage(panelId: number, params?: GenerateParams) {
  return api.post<{ media_object_id: number; status: string }>(`/panels/${panelId}/generate-image`, params ?? {});
}

export function regenerateImage(panelId: number, params?: GenerateParams) {
  return api.post<{ media_object_id: number; status: string }>(`/panels/${panelId}/regenerate-image`, params ?? {});
}

export function generateVideo(panelId: number, params?: { model_override?: string; tool_override?: string }) {
  return api.post<{ media_object_id: number; status: string }>(`/panels/${panelId}/generate-video`, params ?? {});
}

export function generateVoice(panelId: number, voiceLineId: number) {
  return api.post<{ media_object_id: number; status: string }>(`/panels/${panelId}/generate-voice`, { voice_line_id: voiceLineId });
}

export function getCandidates(panelId: number, mediaType: 'image' | 'video') {
  return api.get(`/panels/${panelId}/candidates`, { params: { media_type: mediaType } });
}

export function selectCandidate(panelId: number, mediaObjectId: number, mediaType: 'image' | 'video') {
  return api.post(`/panels/${panelId}/select-candidate`, { media_object_id: mediaObjectId, media_type: mediaType });
}

export function undoRegenerate(panelId: number, mediaType: 'image' | 'video') {
  return api.post(`/panels/${panelId}/undo-regenerate`, { media_type: mediaType });
}
