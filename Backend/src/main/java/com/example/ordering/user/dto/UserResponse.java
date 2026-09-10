package com.example.ordering.user.dto;

import com.example.ordering.user.Role;
import com.example.ordering.user.User;

/**
 * Public-facing view of a user. Never includes the password hash.
 */
public record UserResponse(Long id, String name, String email, Role role) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
