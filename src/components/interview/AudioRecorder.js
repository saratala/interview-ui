import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';

const AudioRecorder = ({ onAudioData, autoStart, isListening }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const isStoppingRef = useRef(false);

    useEffect(() => {
        if (autoStart && isListening && !isStoppingRef.current) {
            startRecording();
        } else if (!isListening) {
            stopRecording();
        }
        return () => {
            stopRecording();
        };
    }, [autoStart, isListening]);

    const stopRecording = async () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            isStoppingRef.current = true;
            mediaRecorder.current.stop();

            // Process any remaining audio chunks
            if (audioChunks.current.length > 0) {
                const audioBlob = new Blob(audioChunks.current, {
                    type: 'audio/webm;codecs=opus'
                });
                await sendAudioToOpenAI(audioBlob);
            }

            // Stop all tracks in the stream
            if (mediaRecorder.current.stream) {
                mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
            }
        }
        setIsRecording(false);
    };

    const startRecording = async () => {
        try {
            isStoppingRef.current = false;
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });

            mediaRecorder.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                    console.log('Audio chunk received, size:', event.data.size);
                }
            };

            mediaRecorder.current.onstop = async () => {
                if (!isStoppingRef.current) {
                    console.log('Processing audio chunk...');
                    const audioBlob = new Blob(audioChunks.current, {
                        type: 'audio/webm;codecs=opus'
                    });
                    await sendAudioToOpenAI(audioBlob);
                    audioChunks.current = [];
                    if (isListening && !isStoppingRef.current) {
                        startRecording();
                    }
                }
            };

            mediaRecorder.current.start(2000);
            setIsRecording(true);
            console.log('Started recording with optimized settings');
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const sendAudioToOpenAI = async (audioBlob) => {
        try {
            console.log('Sending audio chunk to Whisper API...');
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-1');
            formData.append('language', 'en');
            formData.append('response_format', 'json');
            formData.append('temperature', '0');
            formData.append('prompt', 'This is a technical interview response');

            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Whisper API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Whisper transcription received:', data.text);

            if (data.text.trim()) {
                await onAudioData(data.text);
            }
        } catch (error) {
            console.error('Error with Whisper API:', error);
        }
    };

    return (
        <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography
                variant="body1"
                color="primary"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                }}
            >
                <MicIcon color={isRecording ? "error" : "primary"} />
                {isRecording ? "Recording your answer..." : "Waiting to start..."}
            </Typography>
        </Box>
    );
};

export default AudioRecorder;
