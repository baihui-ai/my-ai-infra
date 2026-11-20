package example.order;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
@Entity(name="orders")
public class OrderEntity { @Id private Long id; private String orderNo; @Enumerated(EnumType.STRING) private OrderStatus status; private boolean isDeleted; public Long getId(){return id;} public String getOrderNo(){return orderNo;} public OrderStatus getStatus(){return status;} }
