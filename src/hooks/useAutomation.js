import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { parseSafeJson } from '../lib/dbUtils';
import { usePageUpdate } from './usePageUpdate';
import { getYouTubeVideos, getDriveFiles, isImageMime, isVideoMime, isTextMime } from '../lib/automation';

const CACHE_KEY = 'admac_automation_cache';
const CACHE_TTL = 10 * 60 * 1000;
const DEFAULT_CONFIG = { enabled: false, youtubeChannel: '', driveFolder: '', lastSyncAt: null };

const loadConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('data')
      .eq('key', 'automation_config')
      .single();
    if (!error && data?.data) {
      const parsed = parseSafeJson(data.data);
      if (parsed && typeof parsed === 'object') {
        try {
          localStorage.setItem('admac_site_settings:automation_config', JSON.stringify(parsed));
        } catch { /* ignore */ }
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    }
  } catch (err) {
    console.error('[useAutomation] Erro ao carregar config:', err);
  }
  try {
    const raw = localStorage.getItem('admac_site_settings:automation_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
};

const loadCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.timestamp) return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveCache = (payload) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, timestamp: Date.now() }));
  } catch { /* ignore */ }
};

export const useAutomation = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [videos, setVideos] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const cfg = await loadConfig();
      setConfig(cfg);
      if (!cfg.enabled) {
        setVideos([]);
        setDriveFiles([]);
        setLoading(false);
        return;
      }
      const cache = loadCache();
      const isFresh = cache && (Date.now() - cache.timestamp) < CACHE_TTL
        && cache.config && cache.config.enabled === cfg.enabled
        && cache.config.youtubeChannel === cfg.youtubeChannel
        && cache.config.driveFolder === cfg.driveFolder;
      if (isFresh) {
        setVideos(cache.videos || []);
        setDriveFiles(cache.driveFiles || []);
        setLoading(false);
        return;
      }
      const [ytRes, driveRes] = await Promise.all([
        cfg.youtubeChannel ? getYouTubeVideos(cfg.youtubeChannel) : Promise.resolve({ videos: [] }),
        cfg.driveFolder ? getDriveFiles(cfg.driveFolder) : Promise.resolve({ files: [] })
      ]);
      const vids = ytRes.videos || [];
      const files = driveRes.files || [];
      setVideos(vids);
      setDriveFiles(files);
      saveCache({ config: cfg, videos: vids, driveFiles: files });
      setError(null);
    } catch (err) {
      console.error('[useAutomation] Erro:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  usePageUpdate('automation_config', refresh);

  const images = useMemo(() => driveFiles.filter(f => isImageMime(f.mimeType)), [driveFiles]);
  const driveVideos = useMemo(() => driveFiles.filter(f => isVideoMime(f.mimeType)), [driveFiles]);
  const texts = useMemo(() => driveFiles.filter(f => isTextMime(f.mimeType)), [driveFiles]);

  return { config, videos, images, driveVideos, texts, loading, error, refresh };
};