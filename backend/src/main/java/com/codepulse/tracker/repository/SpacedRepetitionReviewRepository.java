package com.codepulse.tracker.repository;

import com.codepulse.tracker.entity.SpacedRepetitionReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpacedRepetitionReviewRepository extends JpaRepository<SpacedRepetitionReview, Long> {

    Optional<SpacedRepetitionReview> findByUserProblemProgressId(Long userProblemProgressId);

    @Query("SELECT r FROM SpacedRepetitionReview r WHERE r.userProblemProgress.user.id = :userId")
    List<SpacedRepetitionReview> findAllByUserId(Long userId);
}
