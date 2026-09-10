package com.example.ordering.category;

import com.example.ordering.category.dto.CategoryResponse;
import com.example.ordering.category.dto.CreateCategoryRequest;
import com.example.ordering.category.dto.UpdateCategoryRequest;
import com.example.ordering.common.exception.BusinessRuleException;
import com.example.ordering.common.exception.DuplicateResourceException;
import com.example.ordering.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void create_savesNewCategory() {
        CreateCategoryRequest request = new CreateCategoryRequest("Beverages");
        when(categoryRepository.existsByNameIgnoreCase("Beverages")).thenReturn(false);
        when(categoryRepository.save(any(Category.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CategoryResponse response = categoryService.create(request);

        assertThat(response.name()).isEqualTo("Beverages");
    }

    @Test
    void create_rejectsDuplicateName() {
        CreateCategoryRequest request = new CreateCategoryRequest("Beverages");
        when(categoryRepository.existsByNameIgnoreCase("Beverages")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.create(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(categoryRepository, never()).save(any());
    }

    @Test
    void update_rejectsWhenNotFound() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.update(1L, new UpdateCategoryRequest("Desserts")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_allowsKeepingTheSameName() {
        Category existing = new Category("Desserts");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));

        CategoryResponse response = categoryService.update(1L, new UpdateCategoryRequest("Desserts"));

        assertThat(response.name()).isEqualTo("Desserts");
        verify(categoryRepository, never()).existsByNameIgnoreCase(any());
    }

    @Test
    void delete_translatesConstraintViolationIntoBusinessRuleException() {
        Category existing = new Category("Beverages");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        doThrow(new DataIntegrityViolationException("fk violation"))
                .when(categoryRepository).flush();

        assertThatThrownBy(() -> categoryService.delete(1L))
                .isInstanceOf(BusinessRuleException.class);
    }
}
