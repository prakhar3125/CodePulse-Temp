package com.codepulse.tracker.dto;


import lombok.Data;
import java.time.LocalDate;

@Data
public class SpacedRepetitionDto {
    private Long problemId;
    private String problemName;
    private LocalDate nextReviewDate;
    private int repetitions;
}