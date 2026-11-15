const API_BASE = '/api';

export const api = {
  // Dashboard
  getStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Videos
  getVideos: async () => {
    const res = await fetch(`${API_BASE}/videos`);
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  },

  fetchVideoInfo: async (url) => {
    const res = await fetch(`${API_BASE}/videos/fetch-info?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('Failed to fetch video preview');
    return res.json();
  },

  importVideo: async (data) => {
    const res = await fetch(`${API_BASE}/videos/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Import failed');
    }
    return res.json();
  },

  uploadVideo: async (formData) => {
    const res = await fetch(`${API_BASE}/videos/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  startPipeline: async (videoId) => {
    const res = await fetch(`${API_BASE}/videos/${videoId}/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start pipeline');
    return res.json();
  },

  deleteVideo: async (videoId) => {
    const res = await fetch(`${API_BASE}/videos/${videoId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete video');
    return res.json();
  },

  // Clips
  getClips: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/clips?${query}`);
    if (!res.ok) throw new Error('Failed to fetch clips');
    return res.json();
  },

  getClip: async (clipId) => {
    const res = await fetch(`${API_BASE}/clips/${clipId}`);
    if (!res.ok) throw new Error('Failed to fetch clip details');
    return res.json();
  },

  updateClipMetadata: async (clipId, data) => {
    const res = await fetch(`${API_BASE}/clips/${clipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update clip');
    return res.json();
  },

  approveClip: async (clipId) => {
    const res = await fetch(`${API_BASE}/clips/${clipId}/approve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to approve clip');
    return res.json();
  },

  rejectClip: async (clipId) => {
    const res = await fetch(`${API_BASE}/clips/${clipId}/reject`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reject clip');
    return res.json();
  },

  rerenderClip: async (clipId) => {
    const res = await fetch(`${API_BASE}/clips/${clipId}/rerender`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to re-render clip');
    return res.json();
  },

  createCustomCut: async (data) => {
    const res = await fetch(`${API_BASE}/clips/custom-cut`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Custom cut failed');
    }
    return res.json();
  },

  publishNow: async (clipId, platforms = ['youtube']) => {
    const res = await fetch(`${API_BASE}/clips/${clipId}/publish-now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platforms, privacy_status: 'public' })
    });
    if (!res.ok) throw new Error('Publish failed');
    return res.json();
  },

  scheduleClip: async (clipId, scheduleTime, platforms = ['youtube']) => {
    const res = await fetch(`${API_BASE}/clips/${clipId}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platforms, schedule_time: scheduleTime })
    });
    if (!res.ok) throw new Error('Scheduling failed');
    return res.json();
  },

  // Pipeline
  getPipelineStatus: async () => {
    const res = await fetch(`${API_BASE}/pipeline/status`);
    if (!res.ok) throw new Error('Failed to get pipeline status');
    return res.json();
  },

  pausePipeline: async () => {
    const res = await fetch(`${API_BASE}/pipeline/pause`, { method: 'POST' });
    return res.json();
  },

  resumePipeline: async () => {
    const res = await fetch(`${API_BASE}/pipeline/resume`, { method: 'POST' });
    return res.json();
  },

  // Social
  getSocialAccounts: async () => {
    const res = await fetch(`${API_BASE}/social/accounts`);
    if (!res.ok) throw new Error('Failed to fetch social accounts');
    return res.json();
  },

  getYoutubeAuthUrl: async () => {
    const res = await fetch(`${API_BASE}/social/youtube/auth-url`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Could not get YouTube auth URL');
    }
    return res.json();
  },

  connectInstagram: async (accessToken, accountId) => {
    const res = await fetch(`${API_BASE}/social/instagram/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, account_id: accountId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Instagram connection failed');
    }
    return res.json();
  },

  disconnectSocial: async (platform) => {
    const res = await fetch(`${API_BASE}/social/disconnect/${platform}`, { method: 'POST' });
    return res.json();
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  updateSettings: async (data) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Logs
  getLogs: async (limit = 100) => {
    const res = await fetch(`${API_BASE}/logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },

  clearLogs: async () => {
    const res = await fetch(`${API_BASE}/logs/clear`, { method: 'POST' });
    return res.json();
  }
};
