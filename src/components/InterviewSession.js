import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Container } from '@mui/material';
import axios from 'axios';
import { InterviewContext } from '../context/InterviewContext';
import { useNavigate } from 'react-router-dom';

const InterviewSession = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const { addInterviewSession } = useContext(InterviewContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
          `http://localhost:8080/api/interviews?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`
      );
      addInterviewSession(response.data);
      console.log('Session created:', response.data);
      navigate('/interview-room', { state: { sessionData: response.data } });
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  return (
      <Container maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <TextField
              fullWidth
              label="Name"
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
              fullWidth
              label="Email"
              margin="normal"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
            Start Interview
          </Button>
        </Box>
      </Container>
  );
};

export default InterviewSession;