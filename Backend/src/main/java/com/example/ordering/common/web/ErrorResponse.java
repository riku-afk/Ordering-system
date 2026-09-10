package com.example.ordering.common.web;

import java.time.LocalDateTime;

/**
 * Consistent error payload returned by every failed API call.
 */
public record ErrorResponse(int status, String message, LocalDateTime timestamp) {

    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(status, message, LocalDateTime.now());
    }
}
