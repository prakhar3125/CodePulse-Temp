package com.codepulse.tracker.dto;


import lombok.Data;
import java.util.List;

@Data
public class DailyPlanDto {
    private int day;
    private String date;
    private List<ProblemDto> problems;
}
