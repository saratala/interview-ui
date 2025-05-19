import React from 'react';
import { Container } from '@mui/material';
import InterviewContext from './InterviewContext';

const InterviewRoom = () => {
    return (
        <Container maxWidth="lg">
            <InterviewContext />
        </Container>
    );
};

export default InterviewRoom;
