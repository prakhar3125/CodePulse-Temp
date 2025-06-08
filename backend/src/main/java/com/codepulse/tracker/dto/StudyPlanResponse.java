package com.codepulse.tracker.dto;

import lombok.Data;
import java.util.List;

@Data
public class StudyPlanResponse {
    private List<DailyPlanDto> plan;
}