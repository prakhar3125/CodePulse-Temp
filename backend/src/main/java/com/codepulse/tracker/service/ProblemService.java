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
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserProblemProgressRepository progressRepository;
    private final TopicRepository topicRepository;
    private final SpacedRepetitionReviewRepository reviewRepository;

    private static final List<Integer> REPETITION_INTERVALS = Arrays.asList(1, 3, 7, 14, 30, 90);

    @Transactional
    public ProblemDto toggleProblemStatus(Long problemId, User currentUser) {
        UserProblemProgress progress = progressRepository.findByUserIdAndProblemId(currentUser.getId(), problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress not found for this problem."));

        if (progress.getStatus() == UserProblemProgress.Status.pending) {
            progress.setStatus(UserProblemProgress.Status.completed);
            updateSpacedRepetition(progress);
        } else {
            // --- THIS IS THE CORRECTED LOGIC FOR THE "UNTICK" ACTION ---
            progress.setStatus(UserProblemProgress.Status.pending);

            // 1. Find the associated review to be deleted.
            Optional<SpacedRepetitionReview> reviewOpt = reviewRepository.findByUserProblemProgressId(progress.getId());

            reviewOpt.ifPresent(review -> {
                // 2. IMPORTANT: Break the bidirectional link before deleting.
                // This prevents the "inconsistent state" error that causes the 500 status.
                progress.setReview(null);
                review.setUserProblemProgress(null);

                // 3. Now it's safe to delete the review entity.
                reviewRepository.delete(review);
            });
        }

        UserProblemProgress savedProgress = progressRepository.save(progress);
        return DtoMapper.toProblemDto(savedProgress.getProblem(), savedProgress);
    }

    // Note: This method no longer needs the boolean flag
    private void updateSpacedRepetition(UserProblemProgress progress) {
        SpacedRepetitionReview review = reviewRepository.findByUserProblemProgressId(progress.getId())
                .orElse(new SpacedRepetitionReview());

        review.setUserProblemProgress(progress);
        // Link the review back to the progress for consistency
        progress.setReview(review);

        review.setLastReviewedAt(Instant.now());

        int repetitionCount = review.getRepetitionCount() == null ? 0 : review.getRepetitionCount();
        int interval = REPETITION_INTERVALS.get(Math.min(repetitionCount, REPETITION_INTERVALS.size() - 1));

        review.setNextReviewDate(LocalDate.now().plusDays(interval));
        review.setRepetitionCount(repetitionCount + 1);

        reviewRepository.save(review);
    }

    // ... The rest of the file (addCustomProblem, updateNote, etc.) remains the same ...
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

    public DashboardStatsDto getDashboardStats(User currentUser) {
        List<UserProblemProgress> progresses = progressRepository.findAllByUserId(currentUser.getId());
        DashboardStatsDto stats = new DashboardStatsDto();

        stats.setTotal(progresses.size());
        stats.setCompleted((int) progresses.stream().filter(p -> p.getStatus() == UserProblemProgress.Status.completed).count());
        stats.setPercentage(stats.getTotal() > 0 ? (stats.getCompleted() * 100) / stats.getTotal() : 0);

        stats.setEasy(getDifficultyStats(progresses, Problem.Difficulty.Easy));
        stats.setMedium(getDifficultyStats(progresses, Problem.Difficulty.Medium));
        stats.setHard(getDifficultyStats(progresses, Problem.Difficulty.Hard));

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