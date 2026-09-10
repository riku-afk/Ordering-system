package com.example.ordering.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrderItemRequest(

        @NotNull(message = "is required")
        Long productId,

        @NotNull(message = "is required")
        @Positive(message = "must be greater than 0")
        Integer quantity
) {
}
