import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import StudyPlanner from './CodePulseTracker'; // Assuming you renamed it to StudyPlanner in App.js

// Create a wrapper component to handle navigation
const AppContent = () => {
    const navigate = useNavigate();
    
    // Initialize authentication state and user data
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    
    // Check for existing user data on app load (optional - for persistence)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserData(parsedUser);
                setIsAuthenticated(true);
                console.log("App.js: Restored user from localStorage:", parsedUser);
            } catch (error) {
                console.error("Error parsing stored user data:", error);
                localStorage.removeItem('user'); // Clear corrupted data
            }
        }
    }, []);

    // This function will be called by AuthPage on successful sign-in/sign-up
    const handleAuthSuccess = (userInfo) => {
        console.log("App.js: handleAuthSuccess called with user data:", userInfo);
        setIsAuthenticated(true);
        setUserData(userInfo);
        
        // Store user data for persistence (optional)
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        // Navigate immediately after setting authentication
        setTimeout(() => {
            navigate('/track', { replace: true });
        }, 100);
    };

    // Function to handle logout
    const handleLogout = () => {
        console.log("App.js: handleLogout called. Clearing user data.");
        setIsAuthenticated(false);
        setUserData(null);
        
        // Clear user data from localStorage
        localStorage.removeItem('user');
        
        // Navigate immediately after logout
        setTimeout(() => {
            navigate('/authentication', { replace: true });
        }, 100);
    };

    // Log the state every time it changes
    useEffect(() => {
        console.log("App.js: isAuthenticated state changed to:", isAuthenticated);
        console.log("App.js: userData:", userData);
    }, [isAuthenticated, userData]);

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
                    isAuthenticated && userData ? (
                        <StudyPlanner 
                            onLogout={handleLogout} 
                            user={userData} // Pass the user data here
                        />
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