package com.codepulse.tracker.repository;

import com.codepulse.tracker.entity.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    Optional<StudyPlan> findFirstByUserIdOrderByIdDesc(Long userId);
}
