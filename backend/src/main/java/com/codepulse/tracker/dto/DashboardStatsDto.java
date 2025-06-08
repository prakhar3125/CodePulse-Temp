package com.codepulse.tracker.dto;


import lombok.Data;
import java.util.List;

@Data
public class DashboardStatsDto {
    private int total;
    private int completed;
    private int percentage;
    private DifficultyStats easy;
    private DifficultyStats medium;
    private DifficultyStats hard;
    private List<SpacedRepetitionDto> spacedRepetition;

    @Data
    public static class DifficultyStats {
        private int total;
        private int completed;
        private int percentage;
    }
}
