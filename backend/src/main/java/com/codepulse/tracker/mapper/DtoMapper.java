package com.codepulse.tracker.mapper;

import com.codepulse.tracker.dto.ProblemDto;
import com.codepulse.tracker.dto.SpacedRepetitionDto;
import com.codepulse.tracker.dto.UserDto;
import com.codepulse.tracker.entity.Problem;
import com.codepulse.tracker.entity.SpacedRepetitionReview;
import com.codepulse.tracker.entity.User;
import com.codepulse.tracker.entity.UserProblemProgress;

/**
 * Utility class to map between Entity objects and Data Transfer Objects (DTOs).
 */
public class DtoMapper {

    public static UserDto toUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }

    public static ProblemDto toProblemDto(Problem problem, UserProblemProgress progress) {
        ProblemDto dto = new ProblemDto();
        dto.setId(problem.getId());
        dto.setName(problem.getName());
        dto.setDifficulty(problem.getDifficulty());
        dto.setTopic(problem.getTopic() != null ? problem.getTopic().getName() : "General");
        dto.setLeetcodeId(problem.getLeetcodeId());
        dto.setCustomLink(problem.getCustomLink());
        dto.setCustom(problem.isCustom());

        if (progress != null) {
            dto.setStatus(progress.getStatus().name());
            dto.setNotes(progress.getNotes());
        } else {
            dto.setStatus(UserProblemProgress.Status.pending.name());
            dto.setNotes("");
        }
        return dto;
    }

    public static SpacedRepetitionDto toSpacedRepetitionDto(SpacedRepetitionReview review) {
        SpacedRepetitionDto dto = new SpacedRepetitionDto();
        dto.setProblemId(review.getUserProblemProgress().getProblem().getId());
        dto.setProblemName(review.getUserProblemProgress().getProblem().getName());
        dto.setNextReviewDate(review.getNextReviewDate());
        dto.setRepetitions(review.getRepetitionCount());
        return dto;
    }
}

