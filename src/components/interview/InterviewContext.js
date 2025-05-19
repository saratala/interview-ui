import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const InterviewContext = () => {
    const [context, setContext] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const generateQuestion = async () => {
        if (!context.trim()) {
            setError('Please provide interview context');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
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
                            content: "You are an expert technical interviewer. Generate 1 relevant technical interview question based on the given context."
                        },
                        {
                            role: "user",
                            content: `Generate 1 technical interview question for: ${context}. Return only the question as a string without any additional formatting or explanation.`
                        }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const question = data.choices[0].message.content.trim();

            navigate('/interview/session', {
                state: {
                    context: context,
                    questions: [question]
                }
            });

        } catch (err) {
            setError('Failed to generate question. Please try again.');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Set Interview Context
            </Typography>
            <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Example: Senior Full Stack Developer position with focus on React, Node.js, and microservices architecture"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                sx={{ mb: 3 }}
            />
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
            <Button
                variant="contained"
                onClick={generateQuestion}
                disabled={isLoading}
                sx={{ minWidth: 200 }}
            >
                {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    'Start Interview'
                )}
            </Button>
        </Paper>
    );
};

export default InterviewContext;
