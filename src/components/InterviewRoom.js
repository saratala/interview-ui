// src/components/InterviewRoom.js
import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const InterviewRoom = () => {
    const videoRef = useRef(null);
    const [transcript, setTranscript] = useState('');
    const recognition = useRef(null);
    const synthesis = window.speechSynthesis;
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [qaPairs, setQaPairs] = useState([]);
    const navigate = useNavigate();

    const questions = [
        "Tell me about yourself.",
        "What are your greatest strengths?",
        "Where do you see yourself in 5 years?",
    ];
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const askQuestion = (questionText) => {
        const utterance = new SpeechSynthesisUtterance(questionText);
        utterance.onend = () => {
            if (!isCompleted) recognition.current.start();
        };
        synthesis.speak(utterance);
    };

    useEffect(() => {
        const initialQaPairs = questions.map(question => ({
            question,
            answer: ''
        }));
        setQaPairs(initialQaPairs);
    }, []);

    const handleGoHome = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        navigate('/');
    };

    useEffect(() => {
        recognition.current = new window.webkitSpeechRecognition();
        recognition.current.continuous = false;
        recognition.current.interimResults = false;

        recognition.current.onresult = (event) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;
            setTranscript(transcript);

            // Update qaPairs with the current answer
            setQaPairs(prev => {
                const newPairs = [...prev];
                newPairs[currentQuestion] = {
                    ...newPairs[currentQuestion],
                    answer: transcript
                };
                return newPairs;
            });
        };

        recognition.current.onend = () => {
            setTimeout(() => {
                if (currentQuestion < questions.length - 1) {
                    setTranscript(''); // Clear transcript for next question
                    setCurrentQuestion(prev => prev + 1);
                } else if (!isCompleted) {
                    setIsCompleted(true);
                    provideFeedback();
                }
            }, 2000);
        };

        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing media devices:', err);
            }
        };
        startMedia();

        setTimeout(() => {
            setIsInterviewStarted(true);
        }, 1000);

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            recognition.current.stop();
        };
    }, [currentQuestion]);

    useEffect(() => {
        if (isInterviewStarted && !isCompleted) {
            askQuestion(questions[currentQuestion]);
        }
    }, [currentQuestion, isInterviewStarted]);

    const generateFeedback = () => {
        const feedbackPoints = [
            "Overall Interview Performance:",
            "• Try to be more specific in your answers",
            "• Provide concrete examples when discussing experiences",
            "• Structure your answers using the STAR method",
            "• Maintain good eye contact and posture"
        ];
        return feedbackPoints;
    };

    const provideFeedback = () => {
        const feedback = "Thank you for completing the interview. Let me summarize your responses and provide feedback.";
        const utterance = new SpeechSynthesisUtterance(feedback);
        synthesis.speak(utterance);
    };

    const handleEndCall = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        navigate('/success');
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                {/* Left section: Video and current status */}
                <Box sx={{ flex: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {/* Video feed */}
                        <Box>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                Current Answer: {transcript}
                            </Typography>
                        </Box>
                        {/* Current status */}
                        <Box sx={{
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}>
                            {isCompleted ? (
                                <>
                                    <Typography variant="h6" color="primary">
                                        Interview Completed
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Interview Summary
                                        </Typography>
                                        {qaPairs.map((qa, index) => (
                                            <Box key={index} sx={{ mb: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Question {index + 1}:
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                                                    {qa.question}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    Your response: {qa.answer}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Feedback
                                        </Typography>
                                        {generateFeedback().map((point, index) => (
                                            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                                                {point}
                                            </Typography>
                                        ))}
                                    </Box>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleEndCall}
                                        >
                                            View Results
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={handleGoHome}
                                        >
                                            Return to Home
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h6">
                                        Current Question: {questions[currentQuestion]}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {currentQuestion === questions.length - 1
                                            ? "This is the final question"
                                            : "The next question will start automatically after you finish speaking"}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Right section: Q&A History */}
                <Paper sx={{
                    flex: 1,
                    p: 2,
                    maxHeight: '600px',
                    overflow: 'auto',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Interview Progress
                    </Typography>
                    {qaPairs.map((qa, index) => (
                        <Box key={index} sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                                Q: {qa.question}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1, ml: 2 }}>
                                A: {qa.answer}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            </Box>
        </Container>
    );
};

export default InterviewRoom;