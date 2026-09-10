package com.example.ordering.common.exception;

/**
 * Thrown when an operation would violate a uniqueness constraint (e.g. an email
 * or category name that is already taken). Translated to a 409 response by
 * {@link com.example.ordering.common.web.GlobalExceptionHandler}.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
