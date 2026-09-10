package com.example.ordering.product;

import com.example.ordering.category.Category;
import com.example.ordering.category.CategoryRepository;
import com.example.ordering.common.exception.ResourceNotFoundException;
import com.example.ordering.product.dto.CreateProductRequest;
import com.example.ordering.product.dto.ProductResponse;
import com.example.ordering.product.dto.UpdateAvailabilityRequest;
import com.example.ordering.product.dto.UpdateProductRequest;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(String search, Long categoryId, Boolean available, Pageable pageable) {
        Specification<Product> spec = buildFilter(search, categoryId, available);
        return productRepository.findAll(spec, pageable).map(ProductResponse::from);
    }

    /**
     * Builds a predicate only for filters that were actually supplied, rather
     * than encoding "no filter" as a null-valued bind parameter compared with
     * IS NULL - Postgres can't infer a type for a null parameter used inside
     * a function like LOWER(...), which fails at the JDBC level.
     */
    private Specification<Product> buildFilter(String search, Long categoryId, Boolean available) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (available != null) {
                predicates.add(cb.equal(root.get("available"), available));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductResponse.from(findProductOrThrow(id));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        Category category = findCategoryOrThrow(request.categoryId());

        Product product = new Product(
                category,
                request.name(),
                request.description(),
                request.price(),
                request.imageUrl(),
                request.available() == null || request.available());

        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        Product product = findProductOrThrow(id);
        Category category = findCategoryOrThrow(request.categoryId());

        product.setCategory(category);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());

        // Flush so the @PreUpdate callback (which stamps updatedAt) runs now,
        // before the response is built, instead of at commit time - otherwise
        // the returned DTO would show the stale updatedAt value.
        productRepository.flush();
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse updateAvailability(Long id, UpdateAvailabilityRequest request) {
        Product product = findProductOrThrow(id);
        product.setAvailable(request.available());
        productRepository.flush();
        return ProductResponse.from(product);
    }

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private Category findCategoryOrThrow(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }
}
