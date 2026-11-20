package example.order;
import java.util.List;
public interface OrderExportSink { void append(String outputName,List<OrderSummary> orders); }
