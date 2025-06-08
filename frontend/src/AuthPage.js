import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import loginBG from './assets/loginBG.jpg';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthPage = ({ onAuthSuccess, isDarkMode }) => {
  const googleClientId = "994245990983-m5le37sunadq280ggv4vqrqt98m3ljch.apps.googleusercontent.com";

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * UPDATED: This function now calls the real backend API for sign-up and login.
   */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    const payload = isSignUp ? {
      name: formData.name,
      email: formData.email,
      password: formData.password
    } : {
      email: formData.email,
      password: formData.password
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors from the backend (e.g., validation, user already exists)
        if (data.error) {
            setErrors({ submit: data.error });
        } else if (typeof data === 'object') {
            // Handle field-specific validation errors
            const fieldErrors = {};
            for (const key in data) {
                fieldErrors[key] = data[key];
            }
            setErrors(fieldErrors);
        } else {
            setErrors({ submit: `An error occurred. Status: ${response.status}` });
        }
        return;
      }
      
      // On success, call the handler with the auth data (jwt and user object)
      onAuthSuccess(data);

    } catch (error) {
      console.error("Authentication API call failed:", error);
      setErrors({ submit: 'Could not connect to the server. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * UPDATED: This function needs to be wired up to a backend endpoint
   * that handles Google Sign-In, creates a user if one doesn't exist,
   * and returns the same AuthResponse object (JWT and user data).
   */
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrors({});
    
    // This is a placeholder for a backend call. You would send the
    // credentialResponse.credential (the Google ID token) to your backend.
    console.log("Google Login Success, sending token to backend (not implemented yet)...");
    
    try {
        // SIMULATED BACKEND CALL
        // In a real app, you would have an endpoint like '/api/auth/google'
        // that validates the token and returns your app's JWT and user data.
        const decodedToken = jwtDecode(credentialResponse.credential);
        const simulatedAuthData = {
            jwt: 'fake-jwt-from-google-signin', // Your backend would generate a real JWT
            user: {
                id: decodedToken.sub,
                name: decodedToken.name,
                email: decodedToken.email,
                avatarUrl: decodedToken.picture,
            }
        };
        
        // Simulating network delay
        await new Promise(res => setTimeout(res, 1000));
        
        onAuthSuccess(simulatedAuthData);

    } catch (error) {
        console.error("Google sign-in process failed:", error);
        setErrors({ submit: 'Google sign-in failed. Please try again.' });
    } finally {
        setLoading(false);
    }
  };


  const handleGoogleLoginError = () => {
    console.error('Google Login Failed');
    setErrors({ submit: 'Google sign-in failed. Please ensure pop-ups are enabled and try again.' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const inputClass = (hasError) =>
  `block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
    hasError
      ? 'border-red-400 bg-red-50/20 text-red-800 placeholder-red-400'
      : 'border-white/30 bg-white/20 text-black placeholder-white/80 hover:border-white/40 focus:bg-white/25 backdrop-blur-sm'
  }`;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
        <div className="min-h-screen relative flex items-center justify-center p-4">
            {/* Background Image and Overlays */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${loginBG})` }} />
            <div className={`absolute inset-0 transition-all duration-300 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'}`} />
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="max-w-md w-full z-10 relative">
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center justify-center mb-4">
                        <h1 className="text-4xl font-extrabold text-black drop-shadow-xl mb-2 font-mono tracking-wide">
                            <span className="text-black-600">&lt;/&gt;</span>CodePulse
                        </h1>
                        <p className="text-lg font-semibold text-white/90 drop-shadow-md tracking-tight">
                            Personalized Coding Progress Tracker
                        </p>
                    </div>
                    <p className="text-white/95 drop-shadow-lg font-medium tracking-wide">
                        {isSignUp ? 'Create an account to track your coding journey' : 'Welcome back! Sign in to continue your progress'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-white/15 border border-white/30">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2 text-black drop-shadow-lg">
                            {isSignUp ? 'Create Account' : 'Sign In'}
                        </h2>
                        <p className="text-sm text-white/90 font-medium">
                            {isSignUp ? 'Join thousands of developers improving their skills' : 'Continue your learning journey'}
                        </p>
                    </div>

                    <div className="space-y-5">
                        {isSignUp && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold mb-2 text-black drop-shadow-md">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-white/70" />
                                    </div>
                                    <input id="name" type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className={inputClass(errors.name)} placeholder="Enter your full name" />
                                </div>
                                {errors.name && <p className="mt-1 text-sm text-red-200 font-medium drop-shadow-md">{errors.name}</p>}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-black drop-shadow-md">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-white/70" />
                                </div>
                                <input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputClass(errors.email)} placeholder="Enter your email" />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-200 font-medium drop-shadow-md">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-black drop-shadow-md">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-white/70" />
                                </div>
                                <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className={`${inputClass(errors.password)} pr-10`} placeholder="Enter your password" />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-5 w-5 text-white/70 hover:text-white/90 transition-colors" /> : <Eye className="h-5 w-5 text-white/70 hover:text-white/90 transition-colors" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-200 font-medium drop-shadow-md">{errors.password}</p>}
                        </div>
                        {isSignUp && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2 text-black drop-shadow-md">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-white/70" />
                                    </div>
                                    <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className={`${inputClass(errors.confirmPassword)} pr-10`} placeholder="Confirm your password" />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5 text-white/70 hover:text-white/90 transition-colors" /> : <Eye className="h-5 w-5 text-white/70 hover:text-white/90 transition-colors" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-sm text-red-200 font-medium drop-shadow-md">{errors.confirmPassword}</p>}
                            </div>
                        )}
                        {errors.submit && (
                            <div className="p-3 border border-red-400/50 rounded-lg bg-red-500/30 backdrop-blur-sm">
                                <p className="text-sm text-red-100 font-medium">{errors.submit}</p>
                            </div>
                        )}
                        <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] backdrop-blur-sm">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </>
                            ) : (
                                isSignUp ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </div>

                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-white/30"></div>
                        <span className="flex-shrink mx-4 text-white/90 font-medium">OR</span>
                        <div className="flex-grow border-t border-white/30"></div>
                    </div>

                    <div className="grid place-items-center">
                        <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} theme="outline" size="large" shape="rectangular" useOneTap />
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-white font-medium">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button type="button" onClick={toggleAuthMode} className="font-semibold text-blue-200 hover:text-blue-100 transition-colors duration-300 underline underline-offset-2">
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="text-center">
                            <p className="text-white font-medium mb-3 drop-shadow-md">
                                Project by: <span className="font-bold text-white">Prakhar Sinha</span>
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <a href="https://www.linkedin.com/in/prakhar3125/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-700/90 transition-all duration-200 transform hover:scale-105 shadow-md">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    LinkedIn
                                </a>
                                <a href="https://github.com/prakhar3125" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/80 text-white text-sm font-medium hover:bg-gray-900/90 transition-all duration-200 transform hover:scale-105 shadow-md">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                    GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </GoogleOAuthProvider>
  );
};

export default AuthPage;
