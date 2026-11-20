package example.order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
public interface OrderRepository extends JpaRepository<OrderEntity,Long> { Slice<OrderEntity> findByStatusAndIsDeletedFalseAndIdGreaterThanOrderByIdAsc(OrderStatus status,Long afterId,Pageable pageable); }
