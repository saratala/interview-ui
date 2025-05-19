import React from 'react';
import { Box, Container, Typography, Link, useMediaQuery, Grid } from '@mui/material';

const Footer = () => {
    const isMobile = useMediaQuery('(max-width:600px)');

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#0f172a', // Matching header color
                color: 'white',
                py: 4,
                px: 2,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb: 2 }}>About InterviewMe</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            InterviewMe is an AI-powered platform designed to help developers prepare for technical interviews through personalized practice sessions and real-time feedback.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Interview Categories</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {['Technical Interviews', 'System Design', 'Behavioral Questions', 'Coding Challenges'].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        textDecoration: 'none',
                                        '&:hover': { color: 'white' }
                                    }}
                                >
                                    {item}
                                </Link>
                            ))}
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Connect With Us</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Email: support@interviewme.com
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Follow us on LinkedIn
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    mt: 4,
                    pt: 3,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        © {new Date().getFullYear()} InterviewMe. All rights reserved.
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        gap: 3,
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'center' : 'flex-start'
                    }}>
                        {['Privacy Policy', 'Terms of Use', 'Contact Us'].map((link) => (
                            <Link
                                key={link}
                                href={`/${link.toLowerCase().replace(' ', '-')}`}
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    textDecoration: 'none',
                                    '&:hover': { color: 'white' }
                                }}
                            >
                                {link}
                            </Link>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;

