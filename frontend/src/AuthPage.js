import React, { useState } from 'react';
// CHANGE: Imported HeartPulse for the new logo
import { Eye, EyeOff, Mail, Lock, User, HeartPulse, Zap, CheckCircle } from 'lucide-react';

// The component now accepts an isDarkMode prop to control the theme
const AuthPage = ({ onAuthSuccess, isDarkMode }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock authentication success
      const userData = {
        id: Date.now(),
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || formData.email)}&background=3b82f6&color=ffffff`
      };

      onAuthSuccess(userData);
    } catch (error) {
      setErrors({ submit: 'Authentication failed. Please try again.' });
    } finally {
      setLoading(false);
    }
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

  // Reusable input class with dark mode variants
  const inputClass = (hasError) =>
    `block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      hasError
        ? 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
        : 'border-gray-300 dark:border-gray-600'
    } dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`;

  return (
    // CHANGE: Added dark mode gradient background
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="dark:bg-gradient-to-br dark:from-gray-900 dark:via-slate-900 dark:to-black absolute inset-0"></div>
      <div className="max-w-md w-full z-10">
        {/* Header - CHANGE: Updated logo and name to CodePulse */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full shadow-lg">
              <HeartPulse className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CodePulse</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Create an account to track your coding journey' : 'Welcome back! Sign in to continue your progress'}
          </p>
        </div>

        {/* Auth Form - CHANGE: Added dark mode background and text colors */}
        <div className="bg-white dark:bg-gray-800/80 dark:backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {isSignUp ? 'Join thousands of developers improving their skills' : 'Continue your learning journey'}
            </p>
          </div>

          <div className="space-y-5">
            {/* Name Field */}
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={inputClass(errors.name)}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name}</p>}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={inputClass(errors.email)}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`${inputClass(errors.password)} pr-10`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`${inputClass(errors.confirmPassword)} pr-10`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.confirmPassword}</p>}
              </div>
            )}

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500/50 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
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

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleAuthMode}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Features Preview - CHANGE: Updated for dark mode and new branding */}
        <div className="mt-8 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            What you'll get:
          </h3>
          <div className="space-y-3">
            {[
              { icon: Zap, text: 'Personalized coding progress plans' },
              { icon: CheckCircle, text: 'Track your problem-solving streak' },
              { icon: HeartPulse, text: 'Spaced repetition for long-term memory' }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                  <feature.icon className="text-blue-600 dark:text-blue-400" size={16} />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;