import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';

const AudioRecorder = ({ onAudioData, autoStart, isListening, onSilence, mediaStream: externalMediaStream }) => {
    console.log('[AudioRecorder] Rendered. isListening:', isListening, 'autoStart:', autoStart, 'mediaStream:', !!externalMediaStream);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const isStoppingRef = useRef(false);
    const [mediaStream, setMediaStream] = useState(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const silenceStartRef = useRef(null);
    const VOLUME_THRESHOLD = 0.02; // Slightly higher for human voice
    const SILENCE_DURATION = 8000; // 8 seconds for hands-free workflow
    const silenceDetectionActive = useRef(false);
    const isRecordingRef = useRef(isRecording);

    // Update isRecording ref when isRecording state changes
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    // Keep isRecording in sync with isListening
    useEffect(() => {
        if (isListening && !isRecording) {
            setIsRecording(true);
        } else if (!isListening && isRecording) {
            setIsRecording(false);
        }
    }, [isListening]);

    // Helper: Start silence detection
    const startSilenceDetection = (stream) => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        source.connect(analyserRef.current);
        const dataArray = new Float32Array(analyserRef.current.fftSize);
        silenceDetectionActive.current = true;

        const checkSilence = () => {
            if (!silenceDetectionActive.current) return;
            analyserRef.current.getFloatTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i] * dataArray[i];
            }
            const volume = Math.sqrt(sum / dataArray.length);
            // Debug log for volume
            console.log('[AudioRecorder] Volume:', volume, 'isRecording:', isRecordingRef.current);
            if (volume > VOLUME_THRESHOLD) {
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = null;
                    console.log('[AudioRecorder] User resumed speaking, silence timer cleared.');
                }
                silenceStartRef.current = null;
            } else {
                if (!silenceStartRef.current) {
                    silenceStartRef.current = Date.now();
                    console.log('[AudioRecorder] Silence detected, starting 8s timer...');
                    silenceTimerRef.current = setTimeout(() => {
                        console.log('[AudioRecorder] 8s of silence reached, calling onSilence');
                        if (onSilence && isRecordingRef.current) onSilence();
                    }, SILENCE_DURATION);
                }
            }
            requestAnimationFrame(checkSilence);
        };
        checkSilence();
    };

    // Helper: Stop silence detection
    const stopSilenceDetection = () => {
        silenceDetectionActive.current = false;
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        silenceStartRef.current = null;
    };

    // Start/stop recording and silence detection
    useEffect(() => {
        let localStream = null;
        if (autoStart && isListening && !isStoppingRef.current) {
            isStoppingRef.current = false; // Reset stopping flag when starting
            const startWithStream = (stream) => {
                setMediaStream(stream);
                console.log('[AudioRecorder] Starting silence detection and MediaRecorder...');
                startSilenceDetection(stream);
                try {
                    mediaRecorder.current = new MediaRecorder(stream, {
                        mimeType: 'audio/webm;codecs=opus'
                    });
                } catch (err) {
                    console.error('[AudioRecorder] Error creating MediaRecorder:', err);
                    return;
                }
                audioChunks.current = [];
                mediaRecorder.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.current.push(event.data);
                    }
                };
                mediaRecorder.current.onstop = async () => {
                    setIsRecording(false); // Ensure UI updates on stop
                    console.log('MediaRecorder stopped');
                    if (!isStoppingRef.current) {
                        const audioBlob = new Blob(audioChunks.current, {
                            type: 'audio/webm;codecs=opus'
                        });
                        await sendAudioToOpenAI(audioBlob);
                        audioChunks.current = [];
                        if (isListening && !isStoppingRef.current) {
                            mediaRecorder.current.start(2000);
                            setIsRecording(true); // Set recording true on restart
                            console.log('MediaRecorder restarted');
                        }
                    }
                };
                try {
                    mediaRecorder.current.start(2000);
                    setIsRecording(true);
                    console.log('[AudioRecorder] MediaRecorder started');
                } catch (err) {
                    console.error('[AudioRecorder] Error starting MediaRecorder:', err);
                }
            };
            if (externalMediaStream) {
                startWithStream(externalMediaStream);
            } else {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        localStream = stream;
                        startWithStream(stream);
                    })
                    .catch(error => {
                        console.error('Error accessing microphone:', error);
                    });
            }
        } else if (!isListening) {
            stopRecording();
        }
        return () => {
            stopRecording();
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line
    }, [autoStart, isListening, externalMediaStream]);

    // Always start MediaRecorder when isListening becomes true
    useEffect(() => {
        if (isListening && mediaStream && mediaRecorder.current && mediaRecorder.current.state !== 'recording') {
            try {
                mediaRecorder.current.start(2000);
                setIsRecording(true);
                console.log('MediaRecorder forced start due to isListening change');
            } catch (e) {
                console.warn('MediaRecorder could not be started:', e);
            }
        }
    }, [isListening, mediaStream]);

    const stopRecording = async () => {
        isStoppingRef.current = true;
        stopSilenceDetection();
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            console.log('MediaRecorder stopping');
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
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
                console.log('[AudioRecorder] onAudioData called with:', data.text);
            }
        } catch (error) {
            console.error('Error with Whisper API:', error);
        }
    };

    return (
        <Box sx={{ textAlign: 'center', my: 2 }}>
            {console.log('[AudioRecorder] UI render. isListening:', isListening, 'isRecording:', isRecording)}
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
                <MicIcon color={isListening ? "error" : "primary"} />
                {isListening ? "Recording your answer..." : "Waiting to start..."}
            </Typography>
        </Box>
    );
};

export default AudioRecorder;
