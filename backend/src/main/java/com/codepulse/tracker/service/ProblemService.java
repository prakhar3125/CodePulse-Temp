//
//
//// File: src/main/java/com/codepulse/tracker/service/ProblemService.java
//package com.codepulse.tracker.service;
//
//import com.codepulse.tracker.dto.*;
//import com.codepulse.tracker.entity.*;
//import com.codepulse.tracker.exception.ResourceNotFoundException;
//import com.codepulse.tracker.mapper.DtoMapper;
//import com.codepulse.tracker.repository.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.Instant;
//import java.time.LocalDate;
//import java.util.Arrays;
//import java.util.Comparator;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class ProblemService {
//
//    private final ProblemRepository problemRepository;
//    private final UserProblemProgressRepository progressRepository;
//    private final TopicRepository topicRepository;
//    private final SpacedRepetitionReviewRepository reviewRepository;
//
//    // Spaced repetition intervals in days
//    private static final List<Integer> REPETITION_INTERVALS = Arrays.asList(1, 3, 7, 14, 30, 90);
//
//    @Transactional
//    public ProblemDto toggleProblemStatus(Long problemId, User currentUser) {
//        UserProblemProgress progress = progressRepository.findByUserIdAndProblemId(currentUser.getId(), problemId)
//                .orElseThrow(() -> new ResourceNotFoundException("Progress not found for this problem."));
//
//        if (progress.getStatus() == UserProblemProgress.Status.pending) {
//            progress.setStatus(UserProblemProgress.Status.completed);
//            updateSpacedRepetition(progress, true);
//        } else {
//            progress.setStatus(UserProblemProgress.Status.pending);
//            updateSpacedRepetition(progress, false);
//        }
//
//        UserProblemProgress savedProgress = progressRepository.save(progress);
//        return DtoMapper.toProblemDto(savedProgress.getProblem(), savedProgress);
//    }
//
//    private void updateSpacedRepetition(UserProblemProgress progress, boolean completed) {
//        if (completed) {
//            SpacedRepetitionReview review = reviewRepository.findByUserProblemProgressId(progress.getId())
//                    .orElse(new SpacedRepetitionReview());
//
//            review.setUserProblemProgress(progress);
//            review.setLastReviewedAt(Instant.now());
//
//            int repetitionCount = review.getRepetitionCount() == null ? 0 : review.getRepetitionCount();
//            int interval = REPETITION_INTERVALS.get(Math.min(repetitionCount, REPETITION_INTERVALS.size() - 1));
//
//            review.setNextReviewDate(LocalDate.now().plusDays(interval));
//            review.setRepetitionCount(repetitionCount + 1);
//
//            reviewRepository.save(review);
//        } else {
//            // If unmarked, remove it from the review schedule
//            reviewRepository.findByUserProblemProgressId(progress.getId())
//                    .ifPresent(reviewRepository::delete);
//        }
//    }
//
//    @Transactional
//    public ProblemDto addCustomProblem(CustomProblemRequest request, User currentUser) {
//        Topic topic = topicRepository.findByName(request.getTopic())
//                .orElseGet(() -> {
//                    Topic newTopic = new Topic();
//                    newTopic.setName(request.getTopic());
//                    return topicRepository.save(newTopic);
//                });
//
//        Problem problem = new Problem();
//        problem.setName(request.getName());
//        problem.setDifficulty(request.getDifficulty());
//        problem.setTopic(topic);
//        problem.setCustom(true);
//        problem.setCreatedByUser(currentUser);
//        problem.setLeetcodeId(request.getLeetcodeId());
//        problem.setCustomLink(request.getCustomLink());
//        Problem savedProblem = problemRepository.save(problem);
//
//        // Also create a progress record for it
//        UserProblemProgress progress = new UserProblemProgress();
//        progress.setUser(currentUser);
//        progress.setProblem(savedProblem);
//        progress.setStatus(UserProblemProgress.Status.pending);
//        progressRepository.save(progress);
//
//        return DtoMapper.toProblemDto(savedProblem, progress);
//    }
//
//    @Transactional
//    public ProblemDto updateNote(Long problemId, String note, User currentUser) {
//        UserProblemProgress progress = progressRepository.findByUserIdAndProblemId(currentUser.getId(), problemId)
//                .orElseThrow(() -> new ResourceNotFoundException("Problem progress not found"));
//
//        progress.setNotes(note);
//        UserProblemProgress savedProgress = progressRepository.save(progress);
//
//        return DtoMapper.toProblemDto(savedProgress.getProblem(), savedProgress);
//    }
//
//    public DashboardStatsDto getDashboardStats(User currentUser) {
//        List<UserProblemProgress> progresses = progressRepository.findAllByUserId(currentUser.getId());
//        DashboardStatsDto stats = new DashboardStatsDto();
//
//        stats.setTotal(progresses.size());
//        stats.setCompleted((int) progresses.stream().filter(p -> p.getStatus() == UserProblemProgress.Status.completed).count());
//        stats.setPercentage(stats.getTotal() > 0 ? (stats.getCompleted() * 100) / stats.getTotal() : 0);
//
//        stats.setEasy(getDifficultyStats(progresses, Problem.Difficulty.Easy));
//        stats.setMedium(getDifficultyStats(progresses, Problem.Difficulty.Medium));
//        stats.setHard(getDifficultyStats(progresses, Problem.Difficulty.Hard));
//
//        List<SpacedRepetitionDto> reviews = reviewRepository.findAllByUserId(currentUser.getId())
//                .stream()
//                .map(DtoMapper::toSpacedRepetitionDto)
//                .sorted(Comparator.comparing(SpacedRepetitionDto::getNextReviewDate))
//                .collect(Collectors.toList());
//
//        stats.setSpacedRepetition(reviews);
//
//        return stats;
//    }
//
//    private DashboardStatsDto.DifficultyStats getDifficultyStats(List<UserProblemProgress> progresses, Problem.Difficulty difficulty) {
//        DashboardStatsDto.DifficultyStats diffStats = new DashboardStatsDto.DifficultyStats();
//        List<UserProblemProgress> filtered = progresses.stream()
//                .filter(p -> p.getProblem().getDifficulty() == difficulty)
//                .collect(Collectors.toList());
//
//        diffStats.setTotal(filtered.size());
//        diffStats.setCompleted((int) filtered.stream().filter(p -> p.getStatus() == UserProblemProgress.Status.completed).count());
//        diffStats.setPercentage(diffStats.getTotal() > 0 ? (diffStats.getCompleted() * 100) / diffStats.getTotal() : 0);
//        return diffStats;
//    }
//}
// File: src/main/java/com/codepulse/tracker/service/ProblemService.java
package com.codepulse.tracker.service;

import com.codepulse.tracker.dto.*;
import com.codepulse.tracker.entity.*;
import com.codepulse.tracker.exception.ResourceNotFoundException;
import com.codepulse.tracker.mapper.DtoMapper;
import com.codepulse.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserProblemProgressRepository progressRepository;
    private final TopicRepository topicRepository;
    private final SpacedRepetitionReviewRepository reviewRepository;
    // --- NEW DEPENDENCY INJECTED ---
    private final StudyPlanRepository studyPlanRepository;

    // Spaced repetition intervals in days
    private static final List<Integer> REPETITION_INTERVALS = Arrays.asList(1, 3, 7, 14, 30, 90);

    @Transactional
    public ProblemDto toggleProblemStatus(Long problemId, User currentUser) {
        UserProblemProgress progress = progressRepository.findByUserIdAndProblemId(currentUser.getId(), problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress not found for this problem."));

        if (progress.getStatus() == UserProblemProgress.Status.pending) {
            progress.setStatus(UserProblemProgress.Status.completed);
            updateSpacedRepetition(progress, true);
        } else {
            progress.setStatus(UserProblemProgress.Status.pending);
            updateSpacedRepetition(progress, false);
        }

        UserProblemProgress savedProgress = progressRepository.save(progress);
        return DtoMapper.toProblemDto(savedProgress.getProblem(), savedProgress);
    }

    private void updateSpacedRepetition(UserProblemProgress progress, boolean completed) {
        if (completed) {
            SpacedRepetitionReview review = reviewRepository.findByUserProblemProgressId(progress.getId())
                    .orElse(new SpacedRepetitionReview());

            review.setUserProblemProgress(progress);
            review.setLastReviewedAt(Instant.now());

            int repetitionCount = review.getRepetitionCount() == null ? 0 : review.getRepetitionCount();
            int interval = REPETITION_INTERVALS.get(Math.min(repetitionCount, REPETITION_INTERVALS.size() - 1));

            review.setNextReviewDate(LocalDate.now().plusDays(interval));
            review.setRepetitionCount(repetitionCount + 1);

            reviewRepository.save(review);
        } else {
            reviewRepository.findByUserProblemProgressId(progress.getId())
                    .ifPresent(reviewRepository::delete);
        }
    }

    @Transactional
    public ProblemDto addCustomProblem(CustomProblemRequest request, User currentUser) {
        Topic topic = topicRepository.findByName(request.getTopic())
                .orElseGet(() -> {
                    Topic newTopic = new Topic();
                    newTopic.setName(request.getTopic());
                    return topicRepository.save(newTopic);
                });

        Problem problem = new Problem();
        problem.setName(request.getName());
        problem.setDifficulty(request.getDifficulty());
        problem.setTopic(topic);
        problem.setCustom(true);
        problem.setCreatedByUser(currentUser);
        problem.setLeetcodeId(request.getLeetcodeId());
        problem.setCustomLink(request.getCustomLink());
        Problem savedProblem = problemRepository.save(problem);

        UserProblemProgress progress = new UserProblemProgress();
        progress.setUser(currentUser);
        progress.setProblem(savedProblem);
        progress.setStatus(UserProblemProgress.Status.pending);
        progressRepository.save(progress);

        return DtoMapper.toProblemDto(savedProblem, progress);
    }

    @Transactional
    public ProblemDto updateNote(Long problemId, String note, User currentUser) {
        UserProblemProgress progress = progressRepository.findByUserIdAndProblemId(currentUser.getId(), problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem progress not found"));

        progress.setNotes(note);
        UserProblemProgress savedProgress = progressRepository.save(progress);

        return DtoMapper.toProblemDto(savedProgress.getProblem(), savedProgress);
    }

    /**
     * --- METHOD FULLY REWRITTEN ---
     * Calculates dashboard statistics based ONLY on the user's current, active study plan.
     */
    public DashboardStatsDto getDashboardStats(User currentUser) {
        // Step 1: Find the user's most recent (current) study plan.
        StudyPlan currentPlan = studyPlanRepository.findFirstByUserIdOrderByIdDesc(currentUser.getId())
                .orElse(null);

        // If the user has no plan, return an empty DTO.
        if (currentPlan == null || currentPlan.getDailyTasks() == null || currentPlan.getDailyTasks().isEmpty()) {
            // FIX: Instantiate DTOs using the default constructor and setters to avoid the error.
            DashboardStatsDto emptyStats = new DashboardStatsDto();
            emptyStats.setTotal(0);
            emptyStats.setCompleted(0);
            emptyStats.setPercentage(0);

            DashboardStatsDto.DifficultyStats emptyDifficultyStats = new DashboardStatsDto.DifficultyStats();
            emptyDifficultyStats.setTotal(0);
            emptyDifficultyStats.setCompleted(0);
            emptyDifficultyStats.setPercentage(0);

            emptyStats.setEasy(emptyDifficultyStats);
            emptyStats.setMedium(emptyDifficultyStats);
            emptyStats.setHard(emptyDifficultyStats);
            emptyStats.setSpacedRepetition(Collections.emptyList());

            return emptyStats;
        }

        // Step 2: Get the unique IDs of all problems within the current plan.
        List<Long> problemIdsInCurrentPlan = currentPlan.getDailyTasks().stream()
                .map(dailyTask -> dailyTask.getProblem().getId())
                .distinct()
                .collect(Collectors.toList());

        // Step 3: Fetch only the progress records relevant to the current plan.
        List<UserProblemProgress> progresses = progressRepository.findByUserIdAndProblemIdIn(currentUser.getId(), problemIdsInCurrentPlan);

        // Step 4: Calculate stats based on this filtered list of progresses.
        DashboardStatsDto stats = new DashboardStatsDto();

        stats.setTotal(progresses.size());
        stats.setCompleted((int) progresses.stream().filter(p -> p.getStatus() == UserProblemProgress.Status.completed).count());
        stats.setPercentage(stats.getTotal() > 0 ? (stats.getCompleted() * 100) / stats.getTotal() : 0);

        stats.setEasy(getDifficultyStats(progresses, Problem.Difficulty.Easy));
        stats.setMedium(getDifficultyStats(progresses, Problem.Difficulty.Medium));
        stats.setHard(getDifficultyStats(progresses, Problem.Difficulty.Hard));

        // The spaced repetition data should still reflect all completed problems for the user.
        List<SpacedRepetitionDto> reviews = reviewRepository.findAllByUserId(currentUser.getId())
                .stream()
                .map(DtoMapper::toSpacedRepetitionDto)
                .sorted(Comparator.comparing(SpacedRepetitionDto::getNextReviewDate))
                .collect(Collectors.toList());
        stats.setSpacedRepetition(reviews);

        return stats;
    }

    private DashboardStatsDto.DifficultyStats getDifficultyStats(List<UserProblemProgress> progresses, Problem.Difficulty difficulty) {
        DashboardStatsDto.DifficultyStats diffStats = new DashboardStatsDto.DifficultyStats();
        List<UserProblemProgress> filtered = progresses.stream()
                .filter(p -> p.getProblem().getDifficulty() == difficulty)
                .collect(Collectors.toList());

        diffStats.setTotal(filtered.size());
        diffStats.setCompleted((int) filtered.stream().filter(p -> p.getStatus() == UserProblemProgress.Status.completed).count());
        diffStats.setPercentage(diffStats.getTotal() > 0 ? (diffStats.getCompleted() * 100) / diffStats.getTotal() : 0);
        return diffStats;
    }
}
