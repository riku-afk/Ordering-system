package com.example.ordering.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateOrderRequest(

        @NotEmpty(message = "must contain at least one item")
        @Valid
        List<OrderItemRequest> items
) {
}
