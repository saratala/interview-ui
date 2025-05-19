import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Container, Button, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AudioRecorder from './AudioRecorder';
import DoneIcon from '@mui/icons-material/Done';

const InterviewSession = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const interviewData = location.state;
    const videoRef = useRef(null);
    const transcriptRef = useRef('');

    const [isListening, setIsListening] = useState(false);
    const [answerTranscript, setAnswerTranscript] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isTranscriptComplete, setIsTranscriptComplete] = useState(false);
    const [stream, setStream] = useState(null);
    const [isStopping, setIsStopping] = useState(false);

    useEffect(() => {
        const setupInterview = async () => {
            await initializeCamera();
            setTimeout(() => {
                startInterview();
            }, 1000);
        };

        setupInterview();
        return () => cleanup();
    }, []);

    const initializeCamera = async () => {
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(videoStream);
            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    };

    const cleanup = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const startInterview = () => {
        if (!speechSynthesis.speaking) {
            const utterance = new SpeechSynthesisUtterance(interviewData.questions[0]);
            utterance.onend = () => setIsListening(true);
            speechSynthesis.speak(utterance);
        }
    };

    const handleAudioData = async (transcribedText) => {
        if (isStopping) return;

        console.log('Received transcription:', transcribedText);
        setIsTranscribing(true);

        await new Promise((resolve) => {
            transcriptRef.current += ' ' + transcribedText;
            setAnswerTranscript(transcriptRef.current.trim());
            console.log('Updated answer transcript:', transcriptRef.current);
            setIsTranscribing(false);
            setIsTranscriptComplete(true);
            resolve();
        });
    };

    const handleManualComplete = async () => {
        setIsStopping(true);
        setIsListening(false);
        setIsFinalizing(true);

        try {
            // Wait for any pending transcriptions
            await new Promise(resolve => setTimeout(resolve, 2000));

            const finalAnswer = transcriptRef.current.trim();
            console.log('Final Answer Transcript:', finalAnswer);

            if (!finalAnswer) {
                console.log('No answer recorded');
                setIsFinalizing(false);
                setIsStopping(false);
                return;
            }

            setIsAnalyzing(true);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert technical interviewer providing feedback."
                        },
                        {
                            role: "user",
                            content: `Context: ${interviewData.context}\nQuestion: ${interviewData.questions[0]}\nAnswer: ${finalAnswer}\n\nProvide a brief analysis of the answer, highlighting strengths and areas for improvement.`
                        }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            console.log('OpenAI Feedback Response:', data);
            const feedback = data.choices[0].message.content;

            cleanup();
            navigate('/interview-feedback', {
                state: {
                    context: interviewData.context,
                    question: interviewData.questions[0],
                    answer: finalAnswer,
                    feedback: feedback
                }
            });
        } catch (err) {
            console.error('Error generating feedback:', err);
            // Only navigate if we have an answer
            if (transcriptRef.current.trim().length > 0) {
                cleanup();
                navigate('/interview-feedback', {
                    state: {
                        context: interviewData.context,
                        question: interviewData.questions[0],
                        answer: transcriptRef.current.trim(),
                        feedback: "Unable to generate feedback at this time."
                    }
                });
            }
        } finally {
            setIsFinalizing(false);
            setIsStopping(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3} sx={{ py: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Interview Question
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {interviewData.questions[0]}
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Your Answer:
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    minHeight: 100,
                                    backgroundColor: '#f8f9fa',
                                    position: 'relative'
                                }}
                            >
                                {isTranscribing && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)'
                                    }}>
                                        <CircularProgress size={20} />
                                    </Box>
                                )}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        opacity: isTranscribing ? 0.5 : 1
                                    }}
                                >
                                    {answerTranscript || 'Your answer will appear here as you speak...'}
                                </Typography>
                            </Paper>
                        </Box>
                        <AudioRecorder
                            onAudioData={handleAudioData}
                            autoStart={true}
                            isListening={isListening}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleManualComplete}
                                startIcon={<DoneIcon />}
                                disabled={isAnalyzing || isFinalizing}
                                sx={{ minWidth: 200 }}
                            >
                                I'm Done Answering
                            </Button>
                        </Box>
                        {(isAnalyzing || isFinalizing) && (
                            <Typography variant="body2" color="primary" sx={{ mt: 2, textAlign: 'center' }}>
                                {isFinalizing ? 'Finalizing your answer...' : 'Analyzing your answer...'}
                            </Typography>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Your Video Feed
                        </Typography>
                        <Box sx={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default InterviewSession;
