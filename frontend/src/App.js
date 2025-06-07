// App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import StudyPlanner from './CodePulseTracker'; // Assuming you renamed it to StudyPlanner in App.js

// Create a wrapper component to handle navigation
const AppContent = () => {
    const navigate = useNavigate();
    
    // Initialize isAuthenticated. You might want to check localStorage here in a real app.
    const [isAuthenticated, setIsAuthenticated] = useState(false); 

    // This function will be called by AuthPage on successful sign-in/sign-up
    const handleAuthSuccess = (userData) => { 
        console.log("App.js: handleAuthSuccess called. Setting isAuthenticated to true.");
        setIsAuthenticated(true);
        // Optionally, store user data if needed later
        // localStorage.setItem('user', JSON.stringify(userData));
        
        // Navigate immediately after setting authentication
        setTimeout(() => {
            navigate('/track', { replace: true });
        }, 100);
    };

    // New: Function to handle logout
    const handleLogout = () => {
        console.log("App.js: handleLogout called. Setting isAuthenticated to false.");
        setIsAuthenticated(false);
        // Optionally, clear user data from localStorage if stored
        // localStorage.removeItem('user');
        
        // Navigate immediately after logout
        setTimeout(() => {
            navigate('/authentication', { replace: true });
        }, 100);
    };

    // Log the state every time it changes
    useEffect(() => {
        console.log("App.js: isAuthenticated state changed to:", isAuthenticated);
    }, [isAuthenticated]);

    return (
        <Routes>
            {/* Route for authentication */}
            <Route
                path="/authentication"
                element={
                    // If already authenticated, redirect to track page
                    isAuthenticated ? (
                        <Navigate to="/track" replace />
                    ) : (
                        <AuthPage onAuthSuccess={handleAuthSuccess} isDarkMode={false} />
                    )
                }
            />

            {/* Protected route for the main application (StudyPlanner) */}
            <Route
                path="/track"
                element={
                    isAuthenticated ? (
                        <StudyPlanner onLogout={handleLogout} /* Pass onLogout prop here */ />
                    ) : (
                        // If not authenticated, redirect back to authentication page
                        <Navigate to="/authentication" replace />
                    )
                }
            />

            {/* Redirect from root to authentication or track based on auth status */}
            <Route
                path="/"
                element={<Navigate to={isAuthenticated ? "/track" : "/authentication"} replace />}
            />

            {/* Optional: Add a 404 Not Found page */}
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;