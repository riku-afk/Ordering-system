package com.example.ordering.auth;

import com.example.ordering.auth.dto.AuthResponse;
import com.example.ordering.auth.dto.LoginRequest;
import com.example.ordering.auth.dto.RegisterRequest;
import com.example.ordering.common.exception.DuplicateResourceException;
import com.example.ordering.common.exception.ResourceNotFoundException;
import com.example.ordering.security.JwtService;
import com.example.ordering.user.Role;
import com.example.ordering.user.User;
import com.example.ordering.user.UserRepository;
import com.example.ordering.user.dto.UserResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        // New accounts are always plain customers. Admin accounts are never
        // created through the public API - see CLAUDE.md security requirements.
        User user = new User(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                Role.CUSTOMER);

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);
        return AuthResponse.of(token, UserResponse.from(saved));
    }

    public AuthResponse login(LoginRequest request) {
        // Throws BadCredentialsException (-> 401) on a bad email/password combination.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(user);
        return AuthResponse.of(token, UserResponse.from(user));
    }
}
