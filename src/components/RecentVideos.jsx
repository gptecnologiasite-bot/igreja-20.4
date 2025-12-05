import React, { useState, useEffect } from 'react';
import { Youtube } from 'lucide-react';
import '../css/RecentVideos.css';

const RecentVideos = ({ limit = 2, category = null }) => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        // Load videos from localStorage
        const savedVideos = localStorage.getItem('admac_videos');
        if (savedVideos) {
            let allVideos = JSON.parse(savedVideos);

            // Filter by category if specified
            if (category) {
                allVideos = allVideos.filter(video => video.category === category);
            }

            // Filter only active videos
            allVideos = allVideos.filter(video => video.active !== false);

            // Sort by order and get limited number
            const sortedVideos = allVideos
                .sort((a, b) => a.order - b.order)
                .slice(0, limit);

            setVideos(sortedVideos);
        }
    }, [limit, category]);

    if (videos.length === 0) {
        return null;
    }

    // Generate YouTube watch URL
    const getYouTubeWatchUrl = (videoId) => {
        return `https://www.youtube.com/watch?v=${videoId}`;
    };

    return (
        <section className="recent-videos-section">
            <div className="container">
                <h2>Vídeos Recentes</h2>
                <div className="videos-grid">
                    {videos.map((video) => (
                        <div key={video.id} className="video-card">
                            <div className="video-embed-container">
                                <iframe
                                    src={`https://www.youtube.com/embed/${video.videoId}`}
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
                                    href={getYouTubeWatchUrl(video.videoId)}
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
