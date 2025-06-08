//package com.codepulse.tracker.repository;
//
//import com.codepulse.tracker.entity.UserProblemProgress;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface UserProblemProgressRepository extends JpaRepository<UserProblemProgress, Long> {
//    Optional<UserProblemProgress> findByUserIdAndProblemId(Long userId, Long problemId);
//    List<UserProblemProgress> findAllByUserId(Long userId);
//}

package com.codepulse.tracker.repository;

import com.codepulse.tracker.entity.UserProblemProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProblemProgressRepository extends JpaRepository<UserProblemProgress, Long> {
    Optional<UserProblemProgress> findByUserIdAndProblemId(Long userId, Long problemId);
    List<UserProblemProgress> findAllByUserId(Long userId);

    // --- NEW METHOD ---
    // Finds all progress records for a given user that match a list of problem IDs.
    // This is crucial for fetching stats for only the current plan.
    List<UserProblemProgress> findByUserIdAndProblemIdIn(Long userId, List<Long> problemIds);
}
