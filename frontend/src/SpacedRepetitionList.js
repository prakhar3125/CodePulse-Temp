// File: SpacedRepetitionList.js

import React from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

// This component is memoized to prevent re-renders unless its props change.
const SpacedRepetitionList = React.memo(({ problems, isDarkMode }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for accurate comparison

    // This function now just determines the display style based on the date from the backend
    const getReviewStatus = (reviewDateString) => {
        const reviewDate = parseISO(reviewDateString);
        const daysDiff = differenceInDays(reviewDate, today);
        if (daysDiff < 0) return { label: 'Overdue', color: 'text-red-500', Icon: AlertCircle };
        if (daysDiff === 0) return { label: 'Due Today', color: 'text-orange-500', Icon: AlertCircle };
        return { label: `In ${daysDiff} day(s)`, color: 'text-blue-500', Icon: Calendar };
    };
    
    // Sort problems directly by the next review date provided by the backend
    const sortedProblems = [...problems].sort((a, b) => {
        return new Date(a.nextReviewDate) - new Date(b.nextReviewDate);
    });

    return (
        <div className={`p-4 sm:p-6 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Review Schedule</h3>
            {sortedProblems.length > 0 ? (
                <ul className="space-y-4">
                    {sortedProblems.map(problem => {
                        // The nextReviewDate now comes directly from the problem object
                        const { label, color, Icon } = getReviewStatus(problem.nextReviewDate);

                        return (
                            // The key is now problemId from the DTO
                            <li key={problem.problemId} className={`flex items-center justify-between p-3 rounded-md transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex items-center">
                                    <Icon className={`mr-3 flex-shrink-0 ${color}`} size={20} />
                                    <div>
                                        {/* Use problemName from the DTO */}
                                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{problem.problemName}</span>
                                        {/* The backend DTO gives the correct repetition number */}
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Repetition: #{problem.repetitions}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-semibold ${color}`}>{label}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {/* Format the date from the DTO */}
                                        {format(parseISO(problem.nextReviewDate), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                     <CheckCircle className="text-green-500 mb-2" size={32} />
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>All Caught Up!</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Complete a problem to start your review schedule.</p>
                </div>
            )}
        </div>
    );
});

export default SpacedRepetitionList;