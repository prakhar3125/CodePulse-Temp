package com.codepulse.tracker.repository;


import com.codepulse.tracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom query to find a user by their email address.
    // Spring Data JPA automatically implements this method based on its name.
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
}
