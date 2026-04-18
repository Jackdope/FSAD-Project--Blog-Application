package com.personalblog.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.personalblog.dto.LoginRequest;
import com.personalblog.dto.LoginResponse;
import com.personalblog.dto.RegisterRequest;
import com.personalblog.entity.User;
import com.personalblog.repository.UserRepository;
import com.personalblog.security.JwtTokenProvider;

// Removed unused imports

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    
    @Autowired
    private UserRepository userRepository;

    // Removed VerificationTokenRepository

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public String register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsEnabled(true);
        user.setRole("USER");

        user = userRepository.save(user);

        // Email verification removed, user is enabled by default
        user.setIsEnabled(true);
        userRepository.save(user);
        return "Registration successful. You can now login.";
    }

    // verifyEmail method removed

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Allow login even if not verified (for testing)
        // In production, uncomment the verification check below
        // if (!user.getIsEnabled()) {
        //     throw new IllegalArgumentException("Please verify your email before logging in");
        // }

        String token = tokenProvider.generateTokenFromUsername(request.getUsername());

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getId(),
                "Login successful"
        );
    }
}
