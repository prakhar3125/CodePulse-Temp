import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import StudyPlanner from './CodePulseTracker';

// Create a wrapper component to handle navigation and state
const AppContent = () => {
    const navigate = useNavigate();
    
    // Initialize authentication state and user data
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    
    // Check for existing user data and token on app load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserData(parsedUser);
                setIsAuthenticated(true);
                // If the user is already logged in, check for a study plan immediately
                navigate('/track', { state: { checkPlan: true }, replace: true });
            } catch (error) {
                console.error("Error parsing stored user data:", error);
                handleLogout(); // Clear corrupted data
            }
        }
    }, []);

    /**
     * UPDATED: This function is called on successful sign-in/sign-up.
     * It now orchestrates checking for an existing study plan.
     */
    const handleAuthSuccess = async (authData) => {
        console.log("App.js: Auth success, received data:", authData);
        setIsAuthenticated(true);
        setUserData(authData.user);
        
        // Store user data and JWT token for session persistence
        localStorage.setItem('user', JSON.stringify(authData.user));
        localStorage.setItem('token', authData.jwt);
        
        // After auth, navigate to the main app area and trigger a plan check.
        // We pass `checkPlan: true` in the navigation state.
        navigate('/track', { state: { checkPlan: true }, replace: true });
    };

    // Function to handle logout
    const handleLogout = () => {
        console.log("App.js: handleLogout called. Clearing user data.");
        setIsAuthenticated(false);
        setUserData(null);
        
        // Clear all session data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Navigate back to the authentication page
        navigate('/authentication', { replace: true });
    };

    return (
        <Routes>
            {/* Route for authentication */}
            <Route
                path="/authentication"
                element={
                    isAuthenticated ? (
                        <Navigate to="/track" replace state={{ checkPlan: true }} />
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
                            user={userData}
                        />
                    ) : (
                        <Navigate to="/authentication" replace />
                    )
                }
            />

            {/* Redirect from root to the correct page based on auth status */}
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
