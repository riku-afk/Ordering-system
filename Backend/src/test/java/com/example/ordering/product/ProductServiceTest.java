package com.example.ordering.product;

import com.example.ordering.category.Category;
import com.example.ordering.category.CategoryRepository;
import com.example.ordering.common.exception.ResourceNotFoundException;
import com.example.ordering.product.dto.CreateProductRequest;
import com.example.ordering.product.dto.ProductResponse;
import com.example.ordering.product.dto.UpdateAvailabilityRequest;
import com.example.ordering.product.dto.UpdateProductRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Category category() {
        return new Category("Beverages");
    }

    @Test
    void create_defaultsToAvailableWhenNotSpecified() {
        CreateProductRequest request = new CreateProductRequest(
                1L, "Iced Coffee", "Cold brew", new BigDecimal("120.00"), null, null);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category()));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse response = productService.create(request);

        assertThat(response.available()).isTrue();
        assertThat(response.name()).isEqualTo("Iced Coffee");
    }

    @Test
    void create_respectsExplicitUnavailableFlag() {
        CreateProductRequest request = new CreateProductRequest(
                1L, "Seasonal Special", null, new BigDecimal("150.00"), null, false);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category()));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse response = productService.create(request);

        assertThat(response.available()).isFalse();
    }

    @Test
    void create_rejectsUnknownCategory() {
        CreateProductRequest request = new CreateProductRequest(
                99L, "Ghost Item", null, new BigDecimal("10.00"), null, null);

        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(productRepository, never()).save(any());
    }

    @Test
    void update_rejectsWhenProductNotFound() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        UpdateProductRequest request = new UpdateProductRequest(
                1L, "New Name", null, new BigDecimal("10.00"), null);

        assertThatThrownBy(() -> productService.update(1L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateAvailability_flipsFlag() {
        Product product = new Product(category(), "Latte", null, new BigDecimal("100.00"), null, true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductResponse response = productService.updateAvailability(1L, new UpdateAvailabilityRequest(false));

        assertThat(response.available()).isFalse();
    }

    @Test
    void getById_throwsWhenMissing() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
