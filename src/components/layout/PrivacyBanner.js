// src/components/layout/PrivacyBanner.js
import React from 'react';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';

const PrivacyBanner = ({ onAccept, onDeny }) => {
    const isMobile = useMediaQuery('(max-width:600px)');

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                color: 'white',
                p: 2,
                zIndex: 9999,
                boxShadow: '0px -2px 6px rgba(0, 0, 0, 0.2)',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxWidth: 'lg',
                    mx: 'auto',
                    gap: isMobile ? 2 : 0,
                }}
            >
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                    This website uses cookies and similar technologies to enhance your experience. By continuing to use this site, you agree to our use of cookies in accordance with our Privacy Policy and the California Consumer Privacy Act (CCPA).
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={onDeny}
                        sx={{
                            borderRadius: '20px',
                            borderColor: 'white',
                            '&:hover': { backgroundColor: '#333', borderColor: '#fff' },
                        }}
                    >
                        Deny
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#0088cc',
                            color: 'white',
                            borderRadius: '20px',
                            '&:hover': { bgcolor: '#005580' },
                        }}
                        onClick={onAccept}
                    >
                        Accept
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default PrivacyBanner;