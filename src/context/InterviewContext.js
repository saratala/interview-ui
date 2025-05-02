import React, { createContext, useState } from 'react';

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
    const [interviewSessions, setInterviewSessions] = useState([]);

    const addInterviewSession = (session) => {
        setInterviewSessions([...interviewSessions, session]);
    };

    return (
        <InterviewContext.Provider value={{ interviewSessions, addInterviewSession }}>
            {children}
        </InterviewContext.Provider>
    );
};