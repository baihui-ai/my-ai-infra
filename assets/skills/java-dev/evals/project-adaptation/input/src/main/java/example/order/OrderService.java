package example.order;
public class OrderService { protected final OrderRepository repository; public OrderService(OrderRepository repository){this.repository=repository;} public OrderSummary toSummary(OrderEntity order){return new OrderSummary(order.getId(),order.getOrderNo(),order.getStatus());} }
