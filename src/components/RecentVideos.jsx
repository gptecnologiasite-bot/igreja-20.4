import React, { useEffect, useMemo, useState } from 'react';
import { Youtube } from 'lucide-react';
import '../css/RecentVideos.css';
import { supabase } from '../lib/supabase';
import { parseSafeJson } from '../lib/dbUtils';

const RecentVideos = ({ limit = 2, category = null }) => {
    const [remoteVideos, setRemoteVideos] = useState(null);
    const [loading, setLoading] = useState(true);

    // Transforma uma URL qualquer do YouTube em embed nocookie
    const toEmbed = (url) => {
        if (!url || typeof url !== 'string') return '';
        let u = url.trim();
        const iframe = u.match(/src=["'`](.+?)["'`]/i);
        if (iframe && iframe[1]) u = iframe[1];
        if (u.includes('/embed/')) return u.replace('youtube.com', 'youtube-nocookie.com');
        let id = (u.match(/youtu\.be\/([a-zA-Z0-9_-]+)/) || [])[1];
        if (!id) id = (u.match(/[?&]v=([a-zA-Z0-9_-]+)/) || [])[1];
        if (!id) id = (u.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/) || [])[1];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : u;
    };

    // Converte embed para watch
    const toWatch = (urlOrId) => {
        if (!urlOrId) return '#';
        if (/^[a-zA-Z0-9_-]{6,}$/.test(urlOrId)) {
            return `https://www.youtube.com/watch?v=${urlOrId}`;
        }
        const id = (urlOrId.match(/embed\/([a-zA-Z0-9_-]+)/) || [])[1]
            || (urlOrId.match(/[?&]v=([a-zA-Z0-9_-]+)/) || [])[1]
            || (urlOrId.match(/youtu\.be\/([a-zA-Z0-9_-]+)/) || [])[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : urlOrId;
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                // Busca do Supabase
                const { data } = await supabase
                    .from('site_settings')
                    .select('data')
                    .eq('key', 'videos')
                    .single();
                const parsed = parseSafeJson(data?.data);
                let vids = Array.isArray(parsed) ? parsed : [];
                // Fallback para localStorage legado
                if (vids.length === 0) {
                    const saved = localStorage.getItem('admac_videos');
                    if (saved) {
                        vids = JSON.parse(saved);
                    }
                }
                // Filtra por categoria/ativo e normaliza campos
                if (category) {
                    vids = vids.filter(v => v.category === category);
                }
                vids = vids
                    .filter(v => v && v.active !== false)
                    .map((v, idx) => ({
                        id: v.id || idx,
                        title: v.title || 'Vídeo',
                        description: v.description || '',
                        // Prioriza url (embed); senão calcula a partir de videoId
                        embed: v.url ? toEmbed(v.url) : (v.videoId ? `https://www.youtube-nocookie.com/embed/${v.videoId}` : ''),
                        watch: v.url ? toWatch(v.url) : toWatch(v.videoId || ''),
                        thumbnail: v.thumbnail || null,
                        order: Number.isFinite(v.order) ? v.order : idx
                    }))
                    .sort((a, b) => a.order - b.order)
                    .slice(0, limit);
                if (mounted) setRemoteVideos(vids);
            } catch {
                if (mounted) setRemoteVideos([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [limit, category]);

    const videos = useMemo(() => remoteVideos || [], [remoteVideos]);

    if (videos.length === 0) {
        return loading ? null : null;
    }

    return (
        <section className="recent-videos-section">
            <div className="container">
                <h2>Vídeos Recentes</h2>
                <div className="videos-grid">
                    {videos.map((video) => (
                        <div key={video.id} className="video-card">
                            <div className="video-embed-container">
                                <iframe
                                    src={video.embed}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="video-info-card">
                                <h3>{video.title}</h3>
                                {video.description && <p>{video.description}</p>}
                                <a
                                    href={video.watch}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="youtube-link"
                                >
                                    <Youtube size={20} />
                                    Ver no YouTube
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentVideos;
