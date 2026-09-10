package com.example.ordering.order;

import com.example.ordering.common.exception.BusinessRuleException;
import com.example.ordering.common.exception.ResourceNotFoundException;
import com.example.ordering.order.dto.CreateOrderRequest;
import com.example.ordering.order.dto.OrderItemRequest;
import com.example.ordering.order.dto.OrderResponse;
import com.example.ordering.product.Product;
import com.example.ordering.product.ProductRepository;
import com.example.ordering.user.Role;
import com.example.ordering.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    /**
     * Creates an order from product ids and quantities only. Prices are never
     * trusted from the client - they are looked up from the database at the
     * moment of purchase and frozen onto each order item, so a later price
     * change never rewrites the total of a historical order. The whole
     * operation is one transaction: if any item is invalid, nothing is saved.
     */
    @Transactional
    public OrderResponse createOrder(User customer, CreateOrderRequest request) {
        List<ResolvedItem> resolvedItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found: id " + itemRequest.productId()));

            if (!product.isAvailable()) {
                throw new BusinessRuleException(
                        "Product '" + product.getName() + "' is not currently available");
            }

            BigDecimal unitPrice = product.getPrice();
            total = total.add(unitPrice.multiply(BigDecimal.valueOf(itemRequest.quantity())));
            resolvedItems.add(new ResolvedItem(product, itemRequest.quantity(), unitPrice));
        }

        Order order = new Order(customer, OrderStatus.PENDING, total);
        resolvedItems.forEach(resolved ->
                order.addItem(new OrderItem(resolved.product(), resolved.quantity(), resolved.unitPrice())));

        Order saved = orderRepository.saveAndFlush(order);
        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrders(User currentUser, Pageable pageable) {
        Page<Order> orders = currentUser.getRole() == Role.ADMIN
                ? orderRepository.findAll(pageable)
                : orderRepository.findByUserId(currentUser.getId(), pageable);

        return orders.map(OrderResponse::from);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(User currentUser, Long orderId) {
        Order order = findOrderOrThrow(orderId);
        requireOwnershipOrAdmin(currentUser, order);
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = findOrderOrThrow(orderId);

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleException(
                    "Cannot change the status of an order that is already " + order.getStatus());
        }

        order.setStatus(newStatus);
        orderRepository.flush();
        return OrderResponse.from(order);
    }

    private Order findOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private void requireOwnershipOrAdmin(User currentUser, Order order) {
        boolean isOwner = Objects.equals(order.getUser().getId(), currentUser.getId());
        if (currentUser.getRole() != Role.ADMIN && !isOwner) {
            throw new AccessDeniedException("You do not have permission to access this order");
        }
    }

    private record ResolvedItem(Product product, int quantity, BigDecimal unitPrice) {
    }
}
