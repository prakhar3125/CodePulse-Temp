package com.codepulse.tracker.controller;


import com.codepulse.tracker.dto.DailyPlanDto;
import com.codepulse.tracker.dto.StudyPlanRequest;
import com.codepulse.tracker.entity.User;
import com.codepulse.tracker.service.StudyPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-plan")
@RequiredArgsConstructor
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    @PostMapping
    public ResponseEntity<List<DailyPlanDto>> createStudyPlan(
            @Valid @RequestBody StudyPlanRequest request,
            @AuthenticationPrincipal User currentUser) {

        List<DailyPlanDto> plan = studyPlanService.createStudyPlan(request, currentUser);
        return ResponseEntity.ok(plan);
    }

}