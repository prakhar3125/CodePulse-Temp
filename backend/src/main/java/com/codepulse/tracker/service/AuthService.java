package com.codepulse.tracker.service;

import com.codepulse.tracker.dto.AuthResponse;
import com.codepulse.tracker.dto.LoginRequest;
import com.codepulse.tracker.dto.SignUpRequest;
import com.codepulse.tracker.entity.User;
import com.codepulse.tracker.exception.DuplicateResourceException;
import com.codepulse.tracker.mapper.DtoMapper;
import com.codepulse.tracker.repository.UserRepository;
import com.codepulse.tracker.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse signUp(SignUpRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new DuplicateResourceException("Email is already in use.");
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        // Generate a default avatar URL
        user.setAvatarUrl(String.format("https://ui-avatars.com/api/?name=%s&background=3b82f6&color=ffffff",
                signUpRequest.getName().replace(" ", "+")));


        User savedUser = userRepository.save(user);

        String jwt = jwtUtil.generateToken(savedUser);
        return new AuthResponse(jwt, DtoMapper.toUserDto(savedUser));
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(user);

        return new AuthResponse(jwt, DtoMapper.toUserDto(user));
    }
}

