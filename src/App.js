import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './components/Home';
import InterviewContext from './components/interview/InterviewContext';
import InterviewSession from './components/interview/InterviewSession';
import InterviewFeedback from './components/interview/InterviewFeedback';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/interview/setup" element={<InterviewContext />} />
                    <Route path="/interview/session" element={<InterviewSession />} />
                    <Route path="/interview-feedback" element={<InterviewFeedback />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
