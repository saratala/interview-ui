import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h1>Welcome to InterviewMe</h1>
            <Link to="/interview-session">Start an Interview</Link>
        </div>
    );
};

export default Home;