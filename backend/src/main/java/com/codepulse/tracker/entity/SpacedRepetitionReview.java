package com.codepulse.tracker.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "spaced_repetition_reviews")
@Data
public class SpacedRepetitionReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_problem_progress_id", nullable = false)
    private UserProblemProgress userProblemProgress;

    @Column(name = "last_reviewed_at", nullable = false)
    private Instant lastReviewedAt;

    @Column(name = "next_review_date", nullable = false)
    private LocalDate nextReviewDate;

    @Column(name = "repetition_count", nullable = false)
    private Integer repetitionCount = 0;
}
