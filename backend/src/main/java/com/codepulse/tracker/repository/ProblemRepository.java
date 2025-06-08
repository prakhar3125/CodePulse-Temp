package com.codepulse.tracker.repository;

import com.codepulse.tracker.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.codepulse.tracker.entity.Topic;


@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findByDifficultyAndTopicIn(Problem.Difficulty difficulty, List<Topic> topics);
    List<Problem> findByDifficulty(Problem.Difficulty difficulty);
}