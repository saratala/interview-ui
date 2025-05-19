import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import PrivacyBanner from './PrivacyBanner';
import MainContent from '../common/MainContent';

const Layout = ({ children }) => {
    const [showPrivacyBanner, setShowPrivacyBanner] = useState(false);

    useEffect(() => {
        const hasAcceptedPrivacy = localStorage.getItem('privacyAccepted');
        if (!hasAcceptedPrivacy) {
            setShowPrivacyBanner(true);
        }
    }, []);

    const handleAcceptPrivacy = () => {
        localStorage.setItem('privacyAccepted', 'true');
        setShowPrivacyBanner(false);
    };

    const handleDenyPrivacy = () => {
        setShowPrivacyBanner(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
            }}
        >
            <Header />
            <MainContent>
                {children}
            </MainContent>
            <Footer />
            {showPrivacyBanner && (
                <PrivacyBanner onAccept={handleAcceptPrivacy} onDeny={handleDenyPrivacy} />
            )}
        </Box>
    );
};

export default Layout;
