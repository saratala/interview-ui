import { createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1a365d',
            dark: '#102a4c',
        },
        background: {
            default: '#ffffff',
            paper: '#0f172a', // Updated to match header/footer
            header: '#0f172a',  // Darker shade for header/footer
        },
        text: {
            primary: '#1a365d',
            secondary: '#ffffff',
        }
    },
    typography: {
        fontFamily: "'Poppins', sans-serif",
        h5: {
            fontWeight: 600,
            letterSpacing: 0.5,
        },
        h1: {
            fontSize: '3.5rem',
            fontWeight: 700,
            letterSpacing: '-0.01562em',
        },
        button: {
            fontWeight: 500,
            letterSpacing: 0.5,
        },
    },
});

export default theme;

