package com.codepulse.tracker.dto;


import com.codepulse.tracker.entity.Problem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CustomProblemRequest {
    @NotBlank
    private String name;

    @NotNull
    private Problem.Difficulty difficulty;

    @NotBlank
    private String topic;

    private String leetcodeId;
    private String customLink;
}
