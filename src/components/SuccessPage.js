import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="success-container">
            <h2>Interview Scheduled Successfully!</h2>
            <p>Thank you for scheduling your interview. We'll send you an email with further details.</p>
            <button onClick={() => navigate('/')} className="back-button">
                Back to Home
            </button>
        </div>
    );
};

export default SuccessPage;