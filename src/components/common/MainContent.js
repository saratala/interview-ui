import React from 'react';
import { Box, Container } from '@mui/material';

const MainContent = ({ children }) => {
    return (
        <Box
            sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                margin: '2rem 0',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    backgroundImage: `url(${require('../../images/interview-me.jpg')})`,
                    backgroundSize: 'contain',  // Changed from 'cover' to 'contain'
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    mx: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '600px', // Added minimum height
                    display: 'flex',
                    flexDirection: 'column',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Reduced opacity from 0.75 to 0.4
                        zIndex: 1,
                    },
                }}
            >
                <Container
                    maxWidth="lg"
                    sx={{
                        position: 'relative',
                        zIndex: 2,
                        py: 6,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {children}
                </Container>
            </Box>
        </Box>
    );
};

export default MainContent;
