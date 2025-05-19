// src/components/layout/Header.js
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';

const Header = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const menuItems = ['Technical', 'Behavioral', 'System Design', 'About'];

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: '#0f172a', // Matching footer color
                color: 'white',
                py: 2, // Reduced padding
                px: 2,
            }}
        >
            <Toolbar sx={{ justifyContent: 'center', gap: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img
                        src={require('../../images/interview-me.jpg')}
                        alt="InterviewMe Logo"
                        style={{
                            height: '45px',
                            width: 'auto',
                            padding: '4px',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            filter: 'brightness(0.95) contrast(1.1)',
                            mixBlendMode: 'lighten'
                        }}
                    />
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            cursor: 'pointer',
                            fontWeight: 600,
                            color: 'white',
                            letterSpacing: '0.5px'
                        }}
                        onClick={() => navigate('/')}
                    >
                        Interview Me
                    </Typography>
                </Box>
                {isMobile ? (
                    <>
                        <IconButton color="inherit" onClick={handleMenuOpen}>
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            {menuItems.map((text) => (
                                <MenuItem
                                    key={text}
                                    onClick={() => {
                                        navigate(`/${text.toLowerCase().replace(' ', '-')}`);
                                        handleMenuClose();
                                    }}
                                >
                                    {text}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                        {menuItems.map((text) => (
                            <Button
                                key={text}
                                onClick={() => navigate(`/${text.toLowerCase().replace(' ', '-')}`)}
                                sx={{
                                    color: 'white',
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                }}
                            >
                                {text}
                            </Button>
                        ))}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;

