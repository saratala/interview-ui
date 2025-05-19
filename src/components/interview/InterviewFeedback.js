import React from 'react';
import { Box, Paper, Typography, Button, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const InterviewFeedback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { context, question, answer, feedback } = location.state || {};

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Interview Feedback
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Context
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {context}
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Question
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {question}
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Your Answer
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                        {answer}
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Feedback
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {feedback}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Start New Interview
                </Button>
            </Paper>
        </Box>
    );
};

export default InterviewFeedback;
