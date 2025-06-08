package com.codepulse.tracker.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "daily_tasks")
@Data
public class DailyTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_plan_id", nullable = false)
    private StudyPlan studyPlan;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;
}

