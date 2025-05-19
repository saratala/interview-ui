import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { InterviewProvider } from './context/InterviewContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <InterviewProvider>
            <App />
        </InterviewProvider>
    </React.StrictMode>
);