package com.example.ordering.order.dto;

import com.example.ordering.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(

        @NotNull(message = "is required")
        OrderStatus status
) {
}
