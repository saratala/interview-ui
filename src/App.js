import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InterviewSession from './components/InterviewSession';
import Home from './components/Home';
import NotFound from './components/NotFound';
import SuccessPage from "./components/SuccessPage";
import InterviewRoom from './components/InterviewRoom';

const App = () => {
  return (
      <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/interview-session" element={<InterviewSession />} />
            <Route path="/interview-room" element={<InterviewRoom />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
  );
};

export default App;
