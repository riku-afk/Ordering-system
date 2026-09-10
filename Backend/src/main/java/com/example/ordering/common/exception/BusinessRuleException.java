package com.example.ordering.common.exception;

/**
 * Thrown when a request is well-formed but violates a business rule
 * (e.g. ordering an unavailable product, an invalid order status transition).
 * Translated to a 400 response by {@link com.example.ordering.common.web.GlobalExceptionHandler}.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
