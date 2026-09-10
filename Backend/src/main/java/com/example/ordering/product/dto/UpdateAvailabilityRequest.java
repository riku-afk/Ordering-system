package com.example.ordering.product.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateAvailabilityRequest(

        @NotNull(message = "is required")
        Boolean available
) {
}
