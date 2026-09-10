package com.example.ordering.product.dto;

import com.example.ordering.category.dto.CategoryResponse;
import com.example.ordering.product.Product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        CategoryResponse category,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        boolean available,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                CategoryResponse.from(product.getCategory()),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                product.isAvailable(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
