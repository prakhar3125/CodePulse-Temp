package com.codepulse.tracker.dto;



import com.codepulse.tracker.entity.Problem;
import lombok.Data;

@Data
public class ProblemDto {
    private Long id;
    private String name;
    private Problem.Difficulty difficulty;
    private String topic;
    private String status;
    private String leetcodeId;
    private String customLink;
    private boolean isCustom;
    private String notes;
}
