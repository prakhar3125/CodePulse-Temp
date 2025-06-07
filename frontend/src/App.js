import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Circle, Plus, BookOpen, Target, Clock, Bell, Link, Edit, Trash2, Star, Brain, Moon, Sun } from 'lucide-react';
import AuthPage from './AuthPage'; // ADD THIS IMPORT AT THE TOP
import problemsData from './problems.json';

const StudyPlanner = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [studyPlan, setStudyPlan] = useState(null);
  const [problems, setProblems] = useState([]);
  const [completedProblems, setCompletedProblems] = useState([]);
  const [notes, setNotes] = useState({});
  const [customProblems, setCustomProblems] = useState([]);
  const [spacedRepetition, setSpacedRepetition] = useState([]);
  const [noteMode, setNoteMode] = useState('text'); // 'text' or 'code'


  // Form state
  const [formData, setFormData] = useState({
    level: 'beginner',
    days: 30,
    topics: [],
    focusAreas: []
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load and save dark mode preference from/to localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Reset all data when logging out
    setStudyPlan(null);
    setProblems([]);
    setCompletedProblems([]);
    setNotes({});
    setCustomProblems([]);
    setSpacedRepetition([]);
    setActiveTab('setup');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const formatNoteContent = (content) => {
    if (!content) return '';

    // Split content by code blocks (```language\ncode\n```)
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const lines = part.split('\n');
        const firstLine = lines[0];
        const language = firstLine.slice(3).trim() || 'text';
        const code = lines.slice(1, -1).join('\n');

        return (
          <div key={index} className="my-3">
            <div className="bg-gray-800 text-gray-200 px-3 py-1 text-xs font-mono rounded-t-md border-b border-gray-600">
              {language}
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-md overflow-x-auto">
              <code className="text-sm font-mono">{code}</code>
            </pre>
          </div>
        );
      } else {
        // Regular text content
        return part.split('\n').map((line, lineIndex) => (
          <div key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < part.split('\n').length - 1 && <br />}
          </div>
        ));
      }
    });
  };

  const insertCodeBlock = (currentText, cursorPosition, language = 'javascript') => {
    const beforeCursor = currentText.slice(0, cursorPosition);
    const afterCursor = currentText.slice(cursorPosition);
    const codeTemplate = `\`\`\`${language}\n// Your code here\n\`\`\``;

    return {
      newText: beforeCursor + codeTemplate + afterCursor,
      newCursorPosition: cursorPosition + `\`\`\`${language}\n`.length
    };
  };

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Available topics for selection
  const availableTopics = [
    { id: 'array', name: 'Array', description: 'Arrays, sorting, searching' },
    { id: 'string', name: 'String', description: 'String manipulation, pattern matching' },
    { id: 'linkedlist', name: 'Linked List', description: 'Single, double, circular linked lists' },
    { id: 'stack', name: 'Stack & Queue', description: 'LIFO and FIFO data structures' },
    { id: 'tree', name: 'Trees', description: 'Binary trees, BST, traversals' },
    { id: 'graph', name: 'Graph', description: 'Graph algorithms, BFS, DFS' },
    { id: 'dp', name: 'Dynamic Programming', description: 'Optimization problems, memoization' },
    { id: 'greedy', name: 'Greedy', description: 'Greedy algorithms and optimization' },
    { id: 'backtracking', name: 'Backtracking', description: 'Recursive problem solving' },
    { id: 'twopointer', name: 'Two Pointers', description: 'Two pointer technique' },
    { id: 'slidingwindow', name: 'Sliding Window', description: 'Window-based problems' },
    { id: 'binarysearch', name: 'Binary Search', description: 'Search in sorted arrays' },
    { id: 'heap', name: 'Heap/Priority Queue', description: 'Min/max heap operations' },
    { id: 'trie', name: 'Trie', description: 'Prefix trees and word problems' },
    { id: 'bit', name: 'Bit Manipulation', description: 'Bitwise operations' },
    { id: 'math', name: 'Math', description: 'Mathematical problems' }
  ];

  const generateProblems = (level, days, selectedTopics) => {
    // Use imported data instead of hardcoded problems
    let allProblems = problemsData[level] || problemsData.beginner;

    // Filter by selected topics if any are specified
    if (selectedTopics && selectedTopics.length > 0) {
      const topicNames = selectedTopics.map(topicId => {
        const topic = availableTopics.find(t => t.id === topicId);
        return topic ? topic.name : topicId;
      });

      allProblems = allProblems.filter(problem =>
        topicNames.some(topicName =>
          problem.topic.toLowerCase().includes(topicName.toLowerCase()) ||
          topicName.toLowerCase().includes(problem.topic.toLowerCase())
        )
      );
    }

    // If no problems match the selected topics, fall back to all problems
    if (allProblems.length === 0) {
      allProblems = problemsData[level] || problemsData.beginner;
    }

    const totalProblems = allProblems.length;

    // Calculate problems per day
    let problemsPerDay;
    if (totalProblems < days) {
      problemsPerDay = 1; // 1 problem per day if we have fewer problems than days
    } else {
      problemsPerDay = Math.ceil(totalProblems / days);
    }

    const dailyPlan = [];
    let problemIndex = 0;

    for (let day = 1; day <= days; day++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + (day - 1));

      const dayProblems = [];

      // Add problems for this day
      if (totalProblems < days) {
        // If fewer problems than days, add 1 problem per day until problems run out
        if (problemIndex < totalProblems) {
          dayProblems.push({
            ...allProblems[problemIndex],
            status: 'pending',
            assignedDay: day
          });
          problemIndex++;
        }
      } else {
        // If more problems than days, distribute evenly
        const startIdx = (day - 1) * problemsPerDay;
        const endIdx = Math.min(startIdx + problemsPerDay, totalProblems);

        for (let i = startIdx; i < endIdx; i++) {
          dayProblems.push({
            ...allProblems[i],
            status: 'pending',
            assignedDay: day
          });
        }
      }

      dailyPlan.push({
        day,
        date: currentDate.toDateString(),
        dateObj: new Date(currentDate), // For easier date handling
        problems: dayProblems
      });
    }

    return dailyPlan;
  };

  const handleFormSubmit = () => {
    const plan = generateProblems(formData.level, formData.days, formData.topics);
    setStudyPlan(plan);

    // Flatten problems for task manager
    const allProblems = plan.flatMap(day => day.problems);
    setProblems(allProblems);

    setActiveTab('dashboard');
  };

  const toggleProblemStatus = (problemId) => {
    setProblems(prev => prev.map(p => {
      if (p.id === problemId) {
        const newStatus = p.status === 'completed' ? 'pending' : 'completed';

        if (newStatus === 'completed') {
          // Add to spaced repetition
          const reviewDates = [
            new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
          ];

          setSpacedRepetition(prev => [...prev, {
            problemId,
            problemName: p.name,
            reviewDates,
            completedReviews: []
          }]);

          setCompletedProblems(prev => [...prev, { ...p, completedDate: new Date() }]);
        }

        return { ...p, status: newStatus };
      }
      return p;
    }));

    // Update the studyPlan state as well to reflect changes in the UI
    setStudyPlan(prev => prev.map(day => ({
      ...day,
      problems: day.problems.map(p => {
        if (p.id === problemId) {
          const newStatus = p.status === 'completed' ? 'pending' : 'completed';
          return { ...p, status: newStatus };
        }
        return p;
      })
    })));
  };

  const addCustomProblem = (customProblem) => {
    const newProblem = {
      id: Date.now(),
      ...customProblem,
      status: 'pending',
      isCustom: true
    };

    // This state is now the single source of truth for the total problem count
    setProblems(prev => [...prev, newProblem]);

    // This state is not being used, you can safely remove it
    // setCustomProblems(prev => [...prev, newProblem]); 

    setStudyPlan(prevPlan => {
      const customDayIndex = prevPlan.findIndex(day => day.day === 'custom');

      // If the "Custom Problems" day doesn't exist yet
      if (customDayIndex === -1) {
        return [
          ...prevPlan,
          {
            day: 'custom',
            date: 'Custom Problems',
            dateObj: new Date(),
            problems: [newProblem] // Create the day with the new problem
          }
        ];
      }

      // If the "Custom Problems" day already exists
      return prevPlan.map((day, index) => {
        // Find the custom day by its index
        if (index === customDayIndex) {
          // Return a *new* object for the custom day
          return {
            ...day, // Copy the old day's properties
            problems: [...day.problems, newProblem] // Create a *new* problems array with the new problem added
          };
        }
        // Return all other days unchanged
        return day;
      });
    });
  };

  const saveNote = (problemId, note) => {
    setNotes(prev => ({ ...prev, [problemId]: note }));
  };

  const getDifficultyColor = (difficulty) => {
    const baseColors = {
      'Easy': isDarkMode ? 'text-green-400 bg-green-900' : 'text-green-600 bg-green-100',
      'Medium': isDarkMode ? 'text-yellow-400 bg-yellow-900' : 'text-yellow-600 bg-yellow-100',
      'Hard': isDarkMode ? 'text-red-400 bg-red-900' : 'text-red-600 bg-red-100',
      'default': isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100'
    };
    return baseColors[difficulty] || baseColors.default;
  };


  const getProgressStats = () => {
    const total = problems.length;
    const completed = problems.filter(p => p.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  };

  // Setup Form Component
  const SetupForm = () => {
    // Add this array right at the top of SetupForm
    const durationPresets = [
      { label: '2 Weeks', days: 14 },
      { label: '1 Month', days: 30 },
      { label: '3 Months', days: 90 },
      { label: '6 Months', days: 180 },
    ];
    const [showAllTopics, setShowAllTopics] = useState(false);

    const handleTopicToggle = (topicId) => {
      setFormData(prev => ({
        ...prev,
        topics: prev.topics.includes(topicId)
          ? prev.topics.filter(id => id !== topicId)
          : [...prev.topics, topicId]
      }));
    };

    const getSelectedTopicNames = () => {
      return formData.topics
        .map(topicId => availableTopics.find(t => t.id === topicId))
        .filter(Boolean)
        .map(topic => topic.name)
        .join(', ');
    };

    const displayedTopics = showAllTopics ? availableTopics : availableTopics.slice(0, 8);

    return (
      <div className={`max-w-4xl mx-auto p-6 rounded-lg shadow-lg transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <Brain className="text-blue-600" />
          AI Study Planner Setup
        </h2>

        <div className="space-y-6">
          {/* Skill Level Section */}
          <div className={`p-4 rounded-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              <Target className="inline w-4 h-4 mr-2" />
              Skill Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'beginner', label: 'Beginner', desc: 'New to coding interviews' },
                { value: 'intermediate', label: 'Intermediate', desc: 'Some practice experience' },
                { value: 'pro', label: 'Pro', desc: 'Advanced problem solver' }
              ].map(level => (
                <div key={level.value} className="relative">
                  <input
                    type="radio"
                    id={level.value}
                    name="level"
                    value={level.value}
                    checked={formData.level === level.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="sr-only"
                  />
                  <label
                    htmlFor={level.value}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.level === level.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : isDarkMode
                          ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className={`text-sm mt-1 ${formData.level === level.value ? 'text-blue-600' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{level.desc}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>


          {/* Study Duration Section */}
          <div className="space-y-3">
            <label className={`flex items-center text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              Study Duration
            </label>

            {(() => {
              const presets = [
                { label: '2 Weeks', days: 14 },
                { label: '1 Month', days: 30 },
                { label: '3 Months', days: 90 }
              ];

              const currentDays = formData.days || 30;

              return (
                <div className="space-y-4">
                  {/* Clean Toggle Buttons */}
                  <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    {presets.map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, days: preset.days }))}
                        className={`flex-1 text-center py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                          formData.days === preset.days
                            ? `bg-white text-gray-900 shadow-sm ${isDarkMode ? '!bg-blue-500 !text-white' : ''}`
                            : isDarkMode
                              ? 'text-gray-400 hover:text-white'
                              : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Minimal Custom Input */}
                  <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Custom duration</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.days || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, days: value === '' ? '' : parseInt(value) || '' }));
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (!value || value < 1) {
                            setFormData(prev => ({ ...prev, days: 30 }));
                          } else if (value > 365) {
                            setFormData(prev => ({ ...prev, days: 365 }));
                          }
                        }}
                        className={`w-16 text-center text-sm font-medium border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500' : 'bg-white border-gray-200 focus:ring-blue-500'}`}
                        placeholder="30"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>days</span>
                    </div>
                  </div>

                  {/* Subtle Duration Preview */}
                  <div className="text-center">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Study plan: {currentDays} day{currentDays !== 1 ? 's' : ''}
                      {currentDays >= 30 && (
                        <span className="ml-1">
                          ({Math.round(currentDays / 30 * 10) / 10} month{currentDays >= 60 ? 's' : ''})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>


          {/* Topic Selection Section */}
          <div className={`p-4 rounded-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <BookOpen className="inline w-4 h-4 mr-2" />
                Focus Topics {formData.topics.length > 0 && `(${formData.topics.length} selected)`}
              </label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, topics: [] }))}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>

            {formData.topics.length > 0 && (
              <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} mb-1`}>Selected Topics:</p>
                <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{getSelectedTopicNames()}</p>
              </div>
            )}

            {/* Minimalist Scrollable List */}
            <div className={`border rounded-lg max-h-72 overflow-y-auto ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <ul className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                {availableTopics.map(topic => (
                  <li
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic.id)}
                    className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                      formData.topics.includes(topic.id)
                        ? isDarkMode ? 'bg-blue-800' : 'bg-blue-50'
                        : isDarkMode ? 'hover:bg-gray-600 bg-gray-800' : 'hover:bg-gray-100 bg-white'
                    }`}
                  >
                    <div>
                      <span className={`font-medium ${
                        formData.topics.includes(topic.id)
                          ? isDarkMode ? 'text-blue-300' : 'text-blue-700'
                          : isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {topic.name}
                      </span>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{topic.description}</p>
                    </div>
                    {formData.topics.includes(topic.id) && (
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 ml-4" />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900 bg-opacity-50' : 'bg-yellow-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>💡 Tip:</strong> {formData.topics.length === 0
                  ? 'Select specific topics for focused practice, or leave empty for a well-rounded curriculum.'
                  : `Your plan will focus on ${formData.topics.length} topic${formData.topics.length > 1 ? 's' : ''} with curated problems.`
                }
              </p>
            </div>
          </div>


          {/* Generate Button */}
          <button
            onClick={handleFormSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-lg shadow-lg hover:shadow-xl"
          >
            🚀 Generate My Personalized Study Plan
          </button>

          {/* Summary */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Plan Summary:</h3>
            <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>• <strong>Level:</strong> {formData.level.charAt(0).toUpperCase() + formData.level.slice(1)}</p>
              <p>• <strong>Duration:</strong> {formData.days} days</p>
              <p>• <strong>Topics:</strong> {formData.topics.length > 0 ? getSelectedTopicNames() : 'All topics (comprehensive)'}</p>
              <p>• <strong>Problems:</strong> AI-curated based on your preferences</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    const stats = getProgressStats();

    return (
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Problems</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
              </div>
              <Target className="text-blue-600" size={24} />
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.percentage}%</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <span className="text-sm font-bold text-blue-600">{stats.percentage}%</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reviews Due</p>
                <p className="text-2xl font-bold text-orange-600">{spacedRepetition.length}</p>
              </div>
              <Bell className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
          <div className={`w-full rounded-full h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stats.completed} of {stats.total} problems completed</p>
        </div>
      </div>
    );
  };

  // Task Manager Component
  const TaskManager = () => {
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [expandedDays, setExpandedDays] = useState(new Set([1, 'custom'])); // Expand first day and custom problems by default
    const [customForm, setCustomForm] = useState({
      name: '',
      difficulty: 'Easy',
      topic: '',
      leetcodeId: '',
      customLink: ''
    });

    const handleCustomSubmit = () => {
      addCustomProblem(customForm);
      setCustomForm({
        name: '',
        difficulty: 'Easy',
        topic: '',
        leetcodeId: '',
        customLink: ''
      });
      setShowCustomForm(false);
    };
    const toggleDay = (dayNumber) => {
      const newExpanded = new Set(expandedDays);
      if (newExpanded.has(dayNumber)) {
        newExpanded.delete(dayNumber);
      } else {
        newExpanded.add(dayNumber);
      }
      setExpandedDays(newExpanded);
    };

    const getDayProgress = (dayProblems) => {
      const completed = dayProblems.filter(p => p.status === 'completed').length;
      const total = dayProblems.length;
      return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const getDayStatus = (dateObj, day) => {
      if (day === 'custom') return 'custom';

      const today = new Date();
      const dayDate = new Date(dateObj);

      today.setHours(0, 0, 0, 0);
      dayDate.setHours(0, 0, 0, 0);

      if (dayDate.getTime() === today.getTime()) return 'today';
      if (dayDate < today) return 'past';
      return 'future';
    };

    const getStatusColor = (status) => {
      if (isDarkMode) {
        switch (status) {
          case 'today': return 'border-blue-400 bg-gray-800';
          case 'past': return 'border-gray-600 bg-gray-800 opacity-70';
          case 'future': return 'border-green-500 bg-gray-800';
          case 'custom': return 'border-purple-500 bg-gray-800';
          default: return 'border-gray-700 bg-gray-800';
        }
      } else {
        switch (status) {
          case 'today': return 'border-blue-500 bg-blue-50';
          case 'past': return 'border-gray-400 bg-gray-50';
          case 'future': return 'border-green-500 bg-green-50';
          case 'custom': return 'border-purple-500 bg-purple-50';
          default: return 'border-gray-300 bg-white';
        }
      }
    };


    const getStatusIcon = (status) => {
      switch (status) {
        case 'today': return '📅';
        case 'past': return '⏳';
        case 'future': return '📍';
        case 'custom': return '⭐';
        default: return '📋';
      }
    };

    const dailyPlans = studyPlan ? studyPlan.filter(p => p.day !== 'custom') : [];
    const customProblemsDay = studyPlan ? studyPlan.find(p => p.day === 'custom') : null;
    
    const inputClasses = `p-2 border rounded-lg transition-colors duration-300 ${
      isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400'
        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
    }`;


    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Task Manager - Day by Day</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setExpandedDays(new Set(studyPlan.map(day => day.day)))}
              className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedDays(new Set())}
              className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Collapse All
            </button>
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Custom Problem
            </button>
          </div>
        </div>

        {showCustomForm && (
          <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Add Custom Problem</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Problem Name"
                  value={customForm.name}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                  className={inputClasses}
                  required
                />
                <select
                  value={customForm.difficulty}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, difficulty: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <input
                  type="text"
                  placeholder="Topic"
                  value={customForm.topic}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, topic: e.target.value }))}
                  className={inputClasses}
                />
                <input
                  type="text"
                  placeholder="LeetCode ID (optional)"
                  value={customForm.leetcodeId}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, leetcodeId: e.target.value }))}
                  className={inputClasses}
                />
              </div>
              <input
                type="url"
                placeholder="Custom Link (optional)"
                value={customForm.customLink}
                onChange={(e) => setCustomForm(prev => ({ ...prev, customLink: e.target.value }))}
                className={`w-full ${inputClasses}`}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCustomSubmit}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Problem
                </button>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Day-wise Problem List */}
        <div className="space-y-4">
          {[...(customProblemsDay ? [customProblemsDay] : []), ...dailyPlans].map(dayPlan => {
            const progress = getDayProgress(dayPlan.problems);
            const dayStatus = getDayStatus(dayPlan.dateObj, dayPlan.day);
            const isExpanded = expandedDays.has(dayPlan.day);

            return (
              <div key={dayPlan.day} className={`rounded-lg shadow border-l-4 transition-all duration-300 ${getStatusColor(dayStatus)}`}>
                {/* Day Header */}
                <div
                  className={`p-4 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  onClick={() => toggleDay(dayPlan.day)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusIcon(dayStatus)}</span>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {dayPlan.day === 'custom' ? 'Custom Problems' : `Day ${dayPlan.day}`}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{dayPlan.date}</p>
                      </div>
                      {dayStatus === 'today' && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Progress Info */}
                      <div className="text-right">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {progress.completed}/{progress.total} Problems
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {progress.percentage}% Complete
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className={`w-20 h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day Problems */}
                {isExpanded && (
                  <div className={`px-4 pb-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    {dayPlan.problems.length > 0 ? (
                      <div className="space-y-3 mt-4">
                        {dayPlan.problems.map(problem => (
                          <ProblemCard
                            key={problem.id}
                            problem={problem}
                            onToggle={toggleProblemStatus}
                            onSaveNote={saveNote}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <Circle className="mx-auto mb-2" size={32} />
                        <p>No problems assigned for this day</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ProblemCard = ({ problem, onToggle, onSaveNote }) => {
    const [notesMode, setNotesMode] = useState('none'); // 'none', 'view', 'edit'
    const [noteText, setNoteText] = useState(notes[problem.id] || '');
    const [textareaRef, setTextareaRef] = useState(null);
    const hasNotes = notes[problem.id] && notes[problem.id].trim().length > 0;

    const handleSaveNote = () => {
      onSaveNote(problem.id, noteText);
      setNotesMode('view');
    };

    const handleNotesClick = () => {
      if (hasNotes && notesMode === 'none') {
        setNotesMode('view');
      } else if (notesMode === 'none' || notesMode === 'view') {
        setNoteText(notes[problem.id] || '');
        setNotesMode('edit');
      } else {
        setNotesMode('none');
      }
    };

    const handleInsertCodeBlock = (language = 'javascript') => {
      if (textareaRef) {
        const cursorPosition = textareaRef.selectionStart;
        const { newText, newCursorPosition } = insertCodeBlock(noteText, cursorPosition, language);
        setNoteText(newText);

        // Set cursor position after state update
        setTimeout(() => {
          textareaRef.setSelectionRange(newCursorPosition, newCursorPosition);
          textareaRef.focus();
        }, 0);
      }
    };

    const handleInsertTemplate = (template) => {
      if (textareaRef) {
        const cursorPosition = textareaRef.selectionStart;
        const beforeCursor = noteText.slice(0, cursorPosition);
        const afterCursor = noteText.slice(cursorPosition);
        const newText = beforeCursor + template + afterCursor;
        setNoteText(newText);

        setTimeout(() => {
          textareaRef.setSelectionRange(cursorPosition + template.length, cursorPosition + template.length);
          textareaRef.focus();
        }, 0);
      }
    };

    const leetcodeUrl = problem.leetcodeId ? `https://leetcode.com/problems/problem-${problem.leetcodeId}/` : null;
    const problemUrl = problem.customLink || leetcodeUrl;

    return (
      <div className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 ${
        isDarkMode
          ? 'border-gray-700 bg-gray-800 hover:bg-gray-750'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggle(problem.id)}
              className="text-2xl"
            >
              {problem.status === 'completed' ?
                <CheckCircle className="text-green-600" size={24} /> :
                <Circle className="text-gray-400" size={24} />
              }
            </button>
            <div>
              <h4 className={`font-medium ${problem.status === 'completed' ? `line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}` : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {problem.name}
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{problem.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            {problem.isCustom && (
              <Star className="text-yellow-500" size={16} />
            )}
            {hasNotes && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" title="Has notes"></div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          {problemUrl && (
            <a
              href={problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
            >
              <Link size={14} />
              {problem.leetcodeId ? `LC-${problem.leetcodeId}` : 'Solve'}
            </a>
          )}
          <button
            onClick={handleNotesClick}
            className={`flex items-center gap-1 text-sm transition-colors ${
              hasNotes
                ? 'text-blue-600 hover:text-blue-800'
                : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Edit size={14} />
            {hasNotes
              ? (notesMode === 'view' ? 'Edit Notes' : notesMode === 'edit' ? 'Cancel' : 'View Notes')
              : 'Add Notes'
            }
          </button>
        </div>

        {/* View Notes Mode */}
        {notesMode === 'view' && hasNotes && (
          <div className={`mt-3 p-4 rounded-lg border-l-4 transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-700 border-blue-400'
              : 'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <h5 className={`font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-900'
              }`}>Notes:</h5>
              <button
                onClick={() => {
                  setNoteText(notes[problem.id]);
                  setNotesMode('edit');
                }}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                <Edit size={12} />
                Edit
              </button>
            </div>
            <div className={`p-3 rounded border transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-600'
                : 'bg-white border-gray-200'
            }`}>
              <div className={`text-sm font-sans leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {formatNoteContent(notes[problem.id])}
              </div>
            </div>
          </div>
        )}

        {/* Edit Notes Mode */}
        {notesMode === 'edit' && (
          <div className={`mt-3 p-4 rounded-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {hasNotes ? 'Edit Notes:' : 'Add Notes:'}
              </h5>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {noteText.length} characters
              </div>
            </div>

            {/* Enhanced Toolbar */}
            <div className={`mb-3 p-3 rounded-lg border transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-600'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select Language:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleInsertCodeBlock('javascript')}
                    className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => handleInsertCodeBlock('python')}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                  >
                    Python
                  </button>
                  <button
                    onClick={() => handleInsertCodeBlock('java')}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                  >
                    Java
                  </button>
                  <button
                    onClick={() => handleInsertCodeBlock('cpp')}
                    className="px-2 py-1 text-xs bg-blue-800 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    C++
                  </button>
                </div>

                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleInsertTemplate('\n## Approach:\n- \n\n## Time Complexity: O()\n## Space Complexity: O()\n\n## Key Points:\n- \n')}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
                  >
                    + Template
                  </button>
                  <button
                    onClick={() => handleInsertTemplate('\n**Edge Cases:**\n- \n- \n\n')}
                    className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors"
                  >
                    + Edge Cases
                  </button>
                </div>
              </div>

              <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Tip:</strong> Use ```language``` to create code blocks. Supports: javascript, python, java, cpp, sql, etc.
              </div>
            </div>

            <textarea
              ref={setTextareaRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your notes here..."
              className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-colors duration-300 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-200 placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              rows="8"
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Save Notes
                </button>
                <button
                  onClick={() => {
                    setNoteText(notes[problem.id] || '');
                    setNotesMode(hasNotes ? 'view' : 'none');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    isDarkMode
                      ? 'bg-gray-600 text-white hover:bg-gray-500'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
              {hasNotes && (
                <button
                  onClick={() => {
                    onSaveNote(problem.id, '');
                    setNoteText('');
                    setNotesMode('none');
                  }}
                  className={`text-red-600 hover:text-red-800 text-sm flex items-center gap-1 ${isDarkMode ? 'hover:text-red-400' : ''}`}
                >
                  <Trash2 size={12} />
                  Delete Notes
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className={`text-2xl font-bold flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <BookOpen className="text-blue-600" />
              AI Study Planner
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border-2 border-blue-200"
                />
                <div className="hidden sm:block">
                  <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                  <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`text-sm px-3 py-1 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'setup', label: 'Setup', icon: Target },
              { id: 'dashboard', label: 'Dashboard', icon: Calendar },
              { id: 'tasks', label: 'Task Manager', icon: CheckCircle },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={tab.id !== 'setup' && !studyPlan}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'setup' && <SetupForm />}
        {activeTab === 'dashboard' && studyPlan && <Dashboard />}
        {activeTab === 'tasks' && studyPlan && <TaskManager />}

        {!studyPlan && activeTab !== 'setup' && (
          <div className="text-center py-12">
            <Brain className={`mx-auto mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={48} />
            <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Study Plan Created</h3>
            <p className={`mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Create a study plan first to access this feature.</p>
            <button
              onClick={() => setActiveTab('setup')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Create Study Plan
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPlanner;