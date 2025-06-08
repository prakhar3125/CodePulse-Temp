package com.codepulse.tracker.dto;

import com.codepulse.tracker.entity.StudyPlan;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class StudyPlanRequest {
    @NotNull(message = "Skill level is required")
    private StudyPlan.SkillLevel level;

    @NotNull(message = "Study duration is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    @Max(value = 365, message = "Duration cannot exceed 365 days")
    private Integer days;

    // List of topic names or IDs
    private List<String> topics;
}