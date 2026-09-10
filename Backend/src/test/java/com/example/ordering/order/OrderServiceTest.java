package com.example.ordering.order;

import com.example.ordering.category.Category;
import com.example.ordering.common.exception.BusinessRuleException;
import com.example.ordering.common.exception.ResourceNotFoundException;
import com.example.ordering.order.dto.CreateOrderRequest;
import com.example.ordering.order.dto.OrderItemRequest;
import com.example.ordering.order.dto.OrderResponse;
import com.example.ordering.product.Product;
import com.example.ordering.product.ProductRepository;
import com.example.ordering.user.Role;
import com.example.ordering.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private User userWithId(long id, Role role) {
        User user = new User("Test User", "user" + id + "@example.com", "hashed", role);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private Product productWithId(long id, String name, String price, boolean available) {
        Product product = new Product(new Category("Beverages"), name, null, new BigDecimal(price), null, available);
        ReflectionTestUtils.setField(product, "id", id);
        return product;
    }

    @Test
    void createOrder_calculatesTotalFromServerSidePrices_ignoringAnyClientPrice() {
        User customer = userWithId(1L, Role.CUSTOMER);
        Product coffee = productWithId(10L, "Iced Coffee", "120.00", true);
        Product tea = productWithId(11L, "Hot Tea", "80.00", true);

        when(productRepository.findById(10L)).thenReturn(Optional.of(coffee));
        when(productRepository.findById(11L)).thenReturn(Optional.of(tea));
        when(orderRepository.saveAndFlush(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateOrderRequest request = new CreateOrderRequest(List.of(
                new OrderItemRequest(10L, 2),
                new OrderItemRequest(11L, 1)));

        OrderResponse response = orderService.createOrder(customer, request);

        // 2 * 120.00 + 1 * 80.00 = 320.00
        assertThat(response.totalAmount()).isEqualByComparingTo("320.00");
        assertThat(response.items()).hasSize(2);
        assertThat(response.status()).isEqualTo(OrderStatus.PENDING);
    }

    @Test
    void createOrder_freezesUnitPriceOnTheOrderItem() {
        User customer = userWithId(1L, Role.CUSTOMER);
        Product product = productWithId(10L, "Iced Coffee", "120.00", true);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        ArgumentCaptor<Order> savedOrder = ArgumentCaptor.forClass(Order.class);
        when(orderRepository.saveAndFlush(savedOrder.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        orderService.createOrder(customer, new CreateOrderRequest(List.of(new OrderItemRequest(10L, 1))));

        // Price changes after the order was placed - the captured order item must
        // still hold the price at the time of purchase, not the live product price.
        product.setPrice(new BigDecimal("200.00"));

        assertThat(savedOrder.getValue().getItems().get(0).getUnitPrice()).isEqualByComparingTo("120.00");
    }

    @Test
    void createOrder_rejectsUnavailableProduct() {
        User customer = userWithId(1L, Role.CUSTOMER);
        Product product = productWithId(10L, "Sold Out Item", "50.00", false);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        CreateOrderRequest request = new CreateOrderRequest(List.of(new OrderItemRequest(10L, 1)));

        assertThatThrownBy(() -> orderService.createOrder(customer, request))
                .isInstanceOf(BusinessRuleException.class);

        verify(orderRepository, org.mockito.Mockito.never()).saveAndFlush(any());
    }

    @Test
    void createOrder_rejectsUnknownProduct() {
        User customer = userWithId(1L, Role.CUSTOMER);
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        CreateOrderRequest request = new CreateOrderRequest(List.of(new OrderItemRequest(999L, 1)));

        assertThatThrownBy(() -> orderService.createOrder(customer, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getOrderById_rejectsAccessToAnotherCustomersOrder() {
        User owner = userWithId(1L, Role.CUSTOMER);
        User otherCustomer = userWithId(2L, Role.CUSTOMER);
        Order order = new Order(owner, OrderStatus.PENDING, new BigDecimal("100.00"));
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.getOrderById(otherCustomer, 5L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void getOrderById_allowsAdminToAccessAnyOrder() {
        User owner = userWithId(1L, Role.CUSTOMER);
        User admin = userWithId(2L, Role.ADMIN);
        Order order = new Order(owner, OrderStatus.PENDING, new BigDecimal("100.00"));
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrderById(admin, 5L);

        assertThat(response.userId()).isEqualTo(1L);
    }

    @Test
    void getOrderById_allowsOwnerToAccessTheirOwnOrder() {
        User owner = userWithId(1L, Role.CUSTOMER);
        Order order = new Order(owner, OrderStatus.PENDING, new BigDecimal("100.00"));
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrderById(owner, 5L);

        assertThat(response.userId()).isEqualTo(1L);
    }

    @Test
    void updateStatus_rejectsChangingAnAlreadyCompletedOrder() {
        User owner = userWithId(1L, Role.CUSTOMER);
        Order order = new Order(owner, OrderStatus.COMPLETED, new BigDecimal("100.00"));
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.updateStatus(5L, OrderStatus.CANCELLED))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void updateStatus_advancesAPendingOrder() {
        User owner = userWithId(1L, Role.CUSTOMER);
        Order order = new Order(owner, OrderStatus.PENDING, new BigDecimal("100.00"));
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.updateStatus(5L, OrderStatus.CONFIRMED);

        assertThat(response.status()).isEqualTo(OrderStatus.CONFIRMED);
    }
}
