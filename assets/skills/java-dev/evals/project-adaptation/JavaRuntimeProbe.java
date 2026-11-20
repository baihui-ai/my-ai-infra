package example.order;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import jakarta.persistence.EntityManager;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

/** Isolated evaluation probe; never point this at a real database. */
public final class JavaRuntimeProbe {
    private static final int BATCH = 17;
    private static final List<String> SQL = new ArrayList<>();
    private static final List<Long> EXPECTED = new ArrayList<>();

    public static void main(String[] args) throws Exception {
        if (args.length != 4 || !args[0].matches("[0-9]{1,5}")
                || !args[1].matches("mai_eval_(with|without)_skill")) {
            throw new IllegalArgumentException("Expected isolated port, database, schema and export-DDL paths");
        }
        String server = "jdbc:mysql://127.0.0.1:" + args[0] + "/";
        String options = "?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC";
        try (Connection connection = DriverManager.getConnection(server + options, "root", "");
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE DATABASE " + args[1]);
        }
        String url = server + args[1] + options;
        prepareDatabase(url, Path.of(args[2]), Path.of(args[3]));
        List<String> observedSql = SQL;
        LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
        factory.setDataSource(new DriverManagerDataSource(url, "root", ""));
        factory.setPackagesToScan("example.order");
        factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        factory.setJpaPropertyMap(Map.of(
                "hibernate.hbm2ddl.auto", "none",
                "hibernate.physical_naming_strategy", "org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy",
                "hibernate.session_factory.statement_inspector", (StatementInspector) sql -> {
                    observedSql.add(sql); return sql;
                }));
        factory.afterPropertiesSet();
        EntityManager entityManager = factory.getObject().createEntityManager();
        try {
            OrderRepository repository = new JpaRepositoryFactory(entityManager).getRepository(OrderRepository.class);
            OrderService service = new OrderService(repository);
            checkQuery(service);
            checkInvalidRequests(service);
            checkFullExport(service);
            checkEmptyExport(service);
            checkFailure(service);
            checkSqlShape(url);
            System.out.println("RESULT\tPASS");
        } finally {
            entityManager.close(); factory.destroy();
        }
    }

    private static void prepareDatabase(String url, Path schema, Path exportDdl) throws Exception {
        try (Connection connection = DriverManager.getConnection(url, "root", "");
             Statement statement = connection.createStatement()) {
            for (Path file : List.of(schema, exportDdl)) {
                String content = Files.readString(file).replaceAll("(?m)^\\s*--[^\\n]*", "");
                for (String ddl : content.split(";")) if (!ddl.isBlank()) statement.execute(ddl);
            }
            try (PreparedStatement insert = connection.prepareStatement(
                    "INSERT INTO orders (id,order_no,status,is_deleted) VALUES (?,?,?,?)")) {
                for (int i = 1; i <= 2000; i++) {
                    long id = i * 2L + 1;
                    boolean paid = i % 8 == 0, deleted = i % 13 == 0;
                    insert.setLong(1, id); insert.setString(2, "ORD-" + id);
                    insert.setString(3, paid ? "PAID" : "PENDING"); insert.setInt(4, deleted ? 1 : 0);
                    insert.addBatch();
                    if (paid && !deleted) EXPECTED.add(id);
                }
                insert.executeBatch();
            }
            statement.executeUpdate("INSERT INTO order_export_record (output_name) VALUES ('defaults-probe')");
            try (ResultSet row = statement.executeQuery("SELECT id,create_time,update_time,create_by,update_by,is_deleted FROM order_export_record")) {
                require(row.next() && row.getLong("id") > 0, "generated export id");
                require(row.getTimestamp("create_time") != null && row.getTimestamp("update_time") != null, "timestamp defaults");
                require(row.getLong("create_by") == 0 && row.getLong("update_by") == 0 && row.getInt("is_deleted") == 0, "base defaults");
            }
            pass("actual DDL accepts minimal insert and fills all six base fields");
            try (ResultSet version = statement.executeQuery("SELECT VERSION()")) {
                version.next(); System.out.println("MYSQL\t" + version.getString(1));
            }
            try (ResultSet plan = statement.executeQuery("EXPLAIN SELECT id,order_no,status FROM orders WHERE status='PAID' AND is_deleted=0 AND id>100 ORDER BY id ASC LIMIT 100")) {
                require(plan.next(), "query plan exists");
                String index = plan.getString("key");
                System.out.println("PLAN\t" + index + "\t" + plan.getLong("rows") + "\t" + plan.getString("Extra"));
                require("idx_status_deleted_id".equals(index), "optimizer selects actual composite index without hints");
            }
            pass("actual MySQL EXPLAIN selects the status/deleted/id index");
        }
    }

    private static Method queryMethod() {
        for (Method method : OrderService.class.getMethods()) {
            if (method.getName().equals("findSummaries") && method.getParameterCount() == 1) return method;
        }
        throw new AssertionError("query entry point missing");
    }

    private static Object queryRequest(OrderStatus status, long cursor, int size) throws Exception {
        return queryMethod().getParameterTypes()[0].getConstructor(OrderStatus.class, long.class, int.class)
                .newInstance(status, cursor, size);
    }

    private static void checkQuery(OrderService service) throws Exception {
        Object response = queryMethod().invoke(service, queryRequest(OrderStatus.PAID, 0, BATCH));
        @SuppressWarnings("unchecked")
        List<OrderSummary> orders = (List<OrderSummary>) response.getClass().getMethod("orders").invoke(response);
        require(orders.stream().map(OrderSummary::id).toList().equals(EXPECTED.subList(0, BATCH)), "first batch matches actual ordered rows");
        require(orders.stream().allMatch(order -> order.status() == OrderStatus.PAID && order.orderNo().equals("ORD-" + order.id())), "summary mapping");
        pass("real Spring Data derived query maps rows, filters soft deletes and orders the first page");
    }

    private static void checkInvalidRequests(OrderService service) throws Exception {
        for (String name : new String[] {null, "", " \t"}) {
            expectIllegal(() -> new OrderExportRequest(name, OrderStatus.PAID, BATCH));
        }
        expectIllegal(() -> queryRequest(OrderStatus.PAID, -1, BATCH));
        expectIllegal(() -> queryRequest(OrderStatus.PAID, 0, 0));
        expectIllegal(() -> queryRequest(null, 0, BATCH));
        pass("blank names, missing status and invalid cursor/batch bounds are rejected");
    }

    private static void checkFullExport(OrderService service) throws Exception {
        List<Long> actual = new ArrayList<>(); AtomicInteger batches = new AtomicInteger();
        OrderExportSink sink = (name, orders) -> {
            require(name.equals("runtime-probe"), "output name preserved");
            require(!orders.isEmpty() && orders.size() <= BATCH, "bounded non-empty append");
            actual.addAll(orders.stream().map(OrderSummary::id).toList()); batches.incrementAndGet();
        };
        Object response = new OrderExportService(service, sink)
                .exportAll(new OrderExportRequest("runtime-probe", OrderStatus.PAID, BATCH));
        long count = (long) response.getClass().getMethod("processedCount").invoke(response);
        require(actual.equals(EXPECTED) && count == EXPECTED.size(), "all matching rows in order with no gaps or duplicate delivery");
        require(batches.get() == (EXPECTED.size() + BATCH - 1) / BATCH, "full and final partial pages");
        pass("multi-page export advances cursor across id gaps and includes the final partial page exactly once");
    }

    private static void checkEmptyExport(OrderService service) throws Exception {
        OrderExportSink sink = (name, orders) -> { throw new AssertionError("empty export called sink"); };
        Object response = new OrderExportService(service, sink)
                .exportAll(new OrderExportRequest("empty", OrderStatus.CLOSED, BATCH));
        require((long) response.getClass().getMethod("processedCount").invoke(response) == 0, "empty count");
        pass("zero matching rows returns zero without calling sink");
    }

    private static void checkFailure(OrderService service) {
        AtomicInteger attempts = new AtomicInteger(); RuntimeException expected = new RuntimeException("synthetic sink failure");
        OrderExportSink sink = (name, orders) -> { if (attempts.incrementAndGet() == 2) throw expected; };
        try {
            new OrderExportService(service, sink).exportAll(new OrderExportRequest("failure", OrderStatus.PAID, BATCH));
            throw new AssertionError("sink failure was reported as success");
        } catch (RuntimeException error) {
            require(error == expected && attempts.get() == 2, "failure identity and no later append");
        }
        pass("second-batch sink failure propagates and prevents further appends");
    }

    private static void checkSqlShape(String url) throws Exception {
        List<String> selects = SQL.stream().map(String::toLowerCase).filter(sql -> sql.contains("from orders")).toList();
        require(selects.size() > 10, "actual derived SQL captured across pages");
        for (String sql : selects) {
            require(!sql.contains(" join ") && sql.contains("is_deleted") && sql.contains("status") && sql.contains("order by") && sql.contains("limit"), "single-table bounded indexed predicates and stable order");
        }
        require(selects.stream().noneMatch(sql -> sql.contains("count(")), "Slice emits no total-count query");
        System.out.println("SQL\t" + selects.get(0));
        pass("captured Hibernate SQL stays single-table, bounded, ordered and avoids count queries");
        try (Connection connection = DriverManager.getConnection(url, "root", "");
             PreparedStatement explain = connection.prepareStatement("EXPLAIN " + selects.get(0))) {
            explain.setString(1, "PAID"); explain.setLong(2, 100); explain.setInt(3, BATCH);
            try (ResultSet plan = explain.executeQuery()) {
                require(plan.next(), "actual ORM query plan exists");
                System.out.println("ORM_PLAN\t" + plan.getString("key") + "\t" + plan.getLong("rows"));
                require("idx_status_deleted_id".equals(plan.getString("key")), "actual derived predicate uses existing index");
            }
        }
        pass("EXPLAIN of the captured Hibernate statement selects the existing composite index");

    }

    private static void expectIllegal(CheckedAction action) throws Exception {
        try { action.run(); } catch (IllegalArgumentException | NullPointerException expected) { return; }
        catch (InvocationTargetException error) {
            if (error.getCause() instanceof IllegalArgumentException || error.getCause() instanceof NullPointerException) return;
            throw error;
        }
        throw new AssertionError("invalid request was accepted");
    }

    private static void pass(String message) { System.out.println("CHECK\tPASS\t" + message); }
    private static void require(boolean condition, String message) { if (!condition) throw new AssertionError(message); }
    @FunctionalInterface private interface CheckedAction { void run() throws Exception; }
}
