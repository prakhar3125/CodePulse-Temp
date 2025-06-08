package com.codepulse.tracker.entity;


import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Table(name = "user_problem_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "problem_id"})
})
@Data
public class UserProblemProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.pending;

    @Lob // Large Object, suitable for long text like notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @OneToOne(mappedBy = "userProblemProgress", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private SpacedRepetitionReview review;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum Status {
        pending, completed
    }
}
