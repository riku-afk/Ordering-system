package com.example.ordering.auth;

import com.example.ordering.auth.dto.AuthResponse;
import com.example.ordering.auth.dto.LoginRequest;
import com.example.ordering.auth.dto.RegisterRequest;
import com.example.ordering.common.exception.DuplicateResourceException;
import com.example.ordering.security.JwtService;
import com.example.ordering.user.Role;
import com.example.ordering.user.User;
import com.example.ordering.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    private AuthService newAuthService() {
        return new AuthService(userRepository, passwordEncoder, authenticationManager, jwtService);
    }

    @Test
    void register_savesCustomerWithHashedPassword() {
        authService = newAuthService();
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "plainPassword123");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User toSave = invocation.getArgument(0);
            return new User(toSave.getName(), toSave.getEmail(), toSave.getPassword(), toSave.getRole());
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("token-123");

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());

        assertThat(savedUser.getValue().getPassword()).isEqualTo("hashed-password");
        assertThat(savedUser.getValue().getPassword()).isNotEqualTo(request.password());
        assertThat(savedUser.getValue().getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(response.token()).isEqualTo("token-123");
        assertThat(response.user().email()).isEqualTo(request.email());
    }

    @Test
    void register_rejectsDuplicateEmail() {
        authService = newAuthService();
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "plainPassword123");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_returnsTokenForValidCredentials() {
        authService = newAuthService();
        LoginRequest request = new LoginRequest("jane@example.com", "plainPassword123");
        User existing = new User("Jane Doe", request.email(), "hashed-password", Role.CUSTOMER);

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(existing));
        when(jwtService.generateToken(existing)).thenReturn("token-123");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("token-123");
        assertThat(response.user().email()).isEqualTo(request.email());
    }

    @Test
    void login_rejectsInvalidCredentials() {
        authService = newAuthService();
        LoginRequest request = new LoginRequest("jane@example.com", "wrong-password");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);

        verify(userRepository, never()).findByEmail(anyString());
    }
}
