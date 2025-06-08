package com.codepulse.tracker.controller;

import com.codepulse.tracker.dto.CustomProblemRequest;
import com.codepulse.tracker.dto.DashboardStatsDto;
import com.codepulse.tracker.dto.NoteUpdateRequest;
import com.codepulse.tracker.dto.ProblemDto;
import com.codepulse.tracker.entity.User;
import com.codepulse.tracker.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @PostMapping("/custom")
    public ResponseEntity<ProblemDto> addCustomProblem(
            @Valid @RequestBody CustomProblemRequest request,
            @AuthenticationPrincipal User currentUser) {
        ProblemDto newProblem = problemService.addCustomProblem(request, currentUser);
        return ResponseEntity.ok(newProblem);
    }

    @PatchMapping("/{problemId}/status")
    public ResponseEntity<ProblemDto> toggleProblemStatus(
            @PathVariable Long problemId,
            @AuthenticationPrincipal User currentUser) {
        ProblemDto updatedProblem = problemService.toggleProblemStatus(problemId, currentUser);
        return ResponseEntity.ok(updatedProblem);
    }

    @PutMapping("/{problemId}/notes")
    public ResponseEntity<ProblemDto> updateNote(
            @PathVariable Long problemId,
            @RequestBody NoteUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        ProblemDto updatedProblem = problemService.updateNote(problemId, request.getNote(), currentUser);
        return ResponseEntity.ok(updatedProblem);
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(@AuthenticationPrincipal User currentUser) {
        DashboardStatsDto stats = problemService.getDashboardStats(currentUser);
        return ResponseEntity.ok(stats);
    }
}