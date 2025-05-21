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
    const [awaitingFinishConfirmation, setAwaitingFinishConfirmation] = useState(false);
    const [silencePrompted, setSilencePrompted] = useState(false);
    const silenceResponseRef = useRef('');

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
            const avStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(avStream);
            if (videoRef.current) {
                videoRef.current.srcObject = avStream;
            }
        } catch (err) {
            console.error('Error accessing camera/microphone:', err);
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

        console.log('[InterviewSession] handleAudioData called:', transcribedText);
        setIsTranscribing(true);

        await new Promise((resolve) => {
            transcriptRef.current += ' ' + transcribedText;
            setAnswerTranscript(transcriptRef.current.trim());
            console.log('[InterviewSession] Updated answer transcript:', transcriptRef.current.trim());
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

    // Helper: check if user response means they are done
    const isAffirmative = (text) => {
        const affirmatives = [
            'yes', 'i am done', "i'm done", 'finished', 'that is my answer', 'that is all', 'done', 'complete', 'completed', 'that is it', 'that is it for now'
        ];
        return affirmatives.some(a => text.toLowerCase().includes(a));
    };

    // Called when AudioRecorder detects silence
    const handleSilence = () => {
        if (!awaitingFinishConfirmation && !silencePrompted) {
            setSilencePrompted(true);
            // Ask the candidate if they are done
            const utterance = new window.SpeechSynthesisUtterance('Did you finish answering?');
            utterance.onend = () => {
                setAwaitingFinishConfirmation(true);
                setIsListening(true); // Listen for their response
            };
            window.speechSynthesis.speak(utterance);
        }
    };

    // Listen for the user's response to the silence prompt
    const handleFinishResponse = async (transcribedText) => {
        if (awaitingFinishConfirmation) {
            silenceResponseRef.current += ' ' + transcribedText;
            if (isAffirmative(silenceResponseRef.current)) {
                setAwaitingFinishConfirmation(false);
                setSilencePrompted(false);
                setIsListening(false);
                setIsFinalizing(true);
                await handleManualComplete();
            } else if (silenceResponseRef.current.trim().length > 0) {
                // If not affirmative, resume normal listening
                setAwaitingFinishConfirmation(false);
                setSilencePrompted(false);
                silenceResponseRef.current = '';
                setIsListening(true);
            }
        } else {
            await handleAudioData(transcribedText);
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
                            onAudioData={awaitingFinishConfirmation ? handleFinishResponse : handleAudioData}
                            autoStart={true}
                            isListening={isListening}
                            onSilence={handleSilence}
                            mediaStream={stream}
                        />
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
