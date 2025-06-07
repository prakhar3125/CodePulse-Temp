import React from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';

// Spaced repetition intervals (in days): e.g., 1 day, 3 days, 1 week, 2 weeks, etc.
const repetitionIntervals = [1, 3, 7, 14, 30, 90];

const getNextReviewDate = (lastReviewed, repetitions) => {
    // Use the next interval, capping at the max defined interval
    const interval = repetitionIntervals[Math.min(repetitions, repetitionIntervals.length - 1)];
    return addDays(parseISO(lastReviewed), interval);
};

// This component is memoized to prevent re-renders unless its props change.
const SpacedRepetitionList = React.memo(({ problems, isDarkMode }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for accurate comparison

    const getReviewStatus = (reviewDate) => {
        const daysDiff = differenceInDays(reviewDate, today);
        if (daysDiff < 0) return { label: 'Overdue', color: 'text-red-500', Icon: AlertCircle };
        if (daysDiff === 0) return { label: 'Due Today', color: 'text-orange-500', Icon: AlertCircle };
        return { label: `In ${daysDiff} day(s)`, color: 'text-blue-500', Icon: Calendar };
    };
    
    // Sort problems by the next review date
    const sortedProblems = [...problems].sort((a, b) => {
        const dateA = getNextReviewDate(a.lastReviewed, a.repetitions);
        const dateB = getNextReviewDate(b.lastReviewed, b.repetitions);
        return dateA - dateB;
    });

    return (
        <div className={`p-4 sm:p-6 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Review Schedule</h3>
            {sortedProblems.length > 0 ? (
                <ul className="space-y-4">
                    {sortedProblems.map(problem => {
                        const nextReviewDate = getNextReviewDate(problem.lastReviewed, problem.repetitions);
                        const { label, color, Icon } = getReviewStatus(nextReviewDate);

                        return (
                            <li key={problem.id} className={`flex items-center justify-between p-3 rounded-md transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex items-center">
                                    <Icon className={`mr-3 flex-shrink-0 ${color}`} size={20} />
                                    <div>
                                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{problem.name}</span>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Repetition: #{problem.repetitions + 1}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-semibold ${color}`}>{label}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {format(nextReviewDate, 'MMM dd, yyyy')}
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