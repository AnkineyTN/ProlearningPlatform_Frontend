import type { AxiosResponse } from 'axios';
import api from '../client';
import type { AdminApiEnvelope } from '../types/adminUsers.types';
import type { AssetType } from '../types/pomodoro.types';

export type AdminSpaceDto = {
  id: number;
  name: string;
  description: string | null;
  assetUrl: string;
  assetType: AssetType;
  source: 'SYSTEM' | 'USER';
};

export type AdminSoundDto = {
  id: number;
  name: string;
  description: string | null;
  assetUrl: string;
  source: 'SYSTEM' | 'USER';
};

export type AdminCreateFromUrlRequest = {
  name: string;
  description?: string;
  url: string;
  assetType: AssetType;
};

export type AdminUpdateAssetRequest = {
  name: string;
  description?: string;
};

export type AdminCreateSpaceFromAssetRequest = {
  name: string;
  description?: string;
  assetId: number;
  assetType: AssetType;
};

export type AdminCreateSoundFromAssetRequest = {
  name: string;
  description?: string;
  assetId: number;
};

export const adminPomodoroAPI = {
  listSpaces: (): Promise<AxiosResponse<AdminApiEnvelope<AdminSpaceDto[]>>> =>
    api.get('/admin/pomodoro/spaces'),

  createSpaceFromUrl: (
    body: AdminCreateFromUrlRequest,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminSpaceDto>>> =>
    api.post('/admin/pomodoro/spaces/url', body),

  createSpaceFromFile: (
    body: AdminCreateSpaceFromAssetRequest,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminSpaceDto>>> =>
    api.post('/admin/pomodoro/spaces', body),

  updateSpace: (
    id: number,
    body: AdminUpdateAssetRequest,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminSpaceDto>>> =>
    api.put(`/admin/pomodoro/spaces/${id}`, body),

  deleteSpace: (id: number): Promise<AxiosResponse<AdminApiEnvelope<void>>> =>
    api.delete(`/admin/pomodoro/spaces/${id}`),

  listSounds: (): Promise<AxiosResponse<AdminApiEnvelope<AdminSoundDto[]>>> =>
    api.get('/admin/pomodoro/sounds'),

  createSoundFromUrl: (
    body: AdminCreateFromUrlRequest,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminSoundDto>>> =>
    api.post('/admin/pomodoro/sounds/url', body),

  createSoundFromFile: (
    body: AdminCreateSoundFromAssetRequest,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminSoundDto>>> =>
    api.post('/admin/pomodoro/sounds', body),

  updateSound: (
    id: number,
    body: AdminUpdateAssetRequest,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminSoundDto>>> =>
    api.put(`/admin/pomodoro/sounds/${id}`, body),

  deleteSound: (id: number): Promise<AxiosResponse<AdminApiEnvelope<void>>> =>
    api.delete(`/admin/pomodoro/sounds/${id}`),
};
