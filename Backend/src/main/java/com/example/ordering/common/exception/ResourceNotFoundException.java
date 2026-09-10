package com.example.ordering.common.exception;

/**
 * Thrown when a requested resource (user, product, order, ...) does not exist.
 * Translated to a 404 response by {@link com.example.ordering.common.web.GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
