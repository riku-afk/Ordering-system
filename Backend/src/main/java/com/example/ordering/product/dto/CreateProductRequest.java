package com.example.ordering.product.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateProductRequest(

        @NotNull(message = "is required")
        Long categoryId,

        @NotBlank(message = "is required")
        @Size(max = 150, message = "must be at most 150 characters")
        String name,

        @Size(max = 2000, message = "must be at most 2000 characters")
        String description,

        @NotNull(message = "is required")
        @Positive(message = "must be greater than 0")
        @Digits(integer = 8, fraction = 2, message = "must have at most 2 decimal places")
        BigDecimal price,

        @Size(max = 500, message = "must be at most 500 characters")
        String imageUrl,

        Boolean available
) {
}
