import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                py: 12,
            }}
        >
            <Typography
                variant="h1"
                component="h1"
                sx={{
                    textAlign: 'center',
                    color: 'primary.main',
                    fontSize: {
                        xs: '2rem',
                        sm: '2.8rem',
                        md: '3.6rem'
                    },
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                }}
            >
                Welcome to Interview Me
            </Typography>

            <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/interview/setup')}
                sx={{
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    padding: { xs: '25px 50px', sm: '30px 70px' },
                    borderRadius: '12px',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    minWidth: { xs: '320px', sm: '400px' },
                    height: { xs: '90px', sm: '110px' },
                    textTransform: 'none',
                }}
            >
                Start an Interview
            </Button>
        </Box>
    );
};

export default Home;
