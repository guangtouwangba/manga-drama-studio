import api from './client';
import type { ProviderConfig } from './types';

export function getProviders() {
  return api.get<ProviderConfig[]>('/settings/providers');
}

export function updateProvider(name: string, config: Partial<ProviderConfig & { api_key?: string }>) {
  return api.put<ProviderConfig>(`/settings/providers/${name}`, config);
}

export function testConnection(name: string) {
  return api.post<{ ok: boolean; latency_ms: number; error: string | null }>(`/settings/providers/${name}/test`);
}
