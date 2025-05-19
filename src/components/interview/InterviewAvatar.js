import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';

const InterviewAvatar = ({ speaking, question }) => {
    const [videoError, setVideoError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Update path to include both silent and speaking versions
    const avatarVideoSilent = '/assets/AIAvatarVideo-silent.mp4';
    const avatarVideoSpeaking = '/assets/AIAvatarVideo-speaking.mp4';

    useEffect(() => {
        const checkVideos = async () => {
            try {
                const responses = await Promise.all([
                    fetch(avatarVideoSilent),
                    fetch(avatarVideoSpeaking)
                ]);

                if (!responses.every(response => response.ok)) {
                    throw new Error('One or more videos failed to load');
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading videos:', error);
                setVideoError(true);
                setIsLoading(false);
            }
        };

        checkVideos();
    }, []);

    if (isLoading) {
        return (
            <Box sx={{
                width: '100%',
                height: '300px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (videoError) {
        return (
            <Box sx={{
                width: '100%',
                height: '300px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Alert severity="error">
                    Could not load AI interviewer video. Please ensure the video file exists at: {avatarVideoUrl}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{
            width: '100%',
            height: '300px',
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5'
        }}>
            <video
                id="avatarVideo"
                autoPlay
                loop={!speaking}
                playsInline
                muted={!speaking}
                onError={() => setVideoError(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            >
                <source
                    src={speaking ? avatarVideoSpeaking : avatarVideoSilent}
                    type="video/mp4"
                />
                Your browser does not support the video tag.
            </video>
            {speaking && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '4px 12px',
                    borderRadius: '16px'
                }}>
                    <Typography color="white" variant="caption">
                        Asking: {question}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default InterviewAvatar;
