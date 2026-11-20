# 关系模型：order-class-diagram（UML 类图 / Claude 风）

## 节点（类）

| 类名 | 属性 | 方法 | 备注 |
|---|---|---|---|
| Order | +id, +status, +totalAmount | +pay(), +cancel() | 核心类，居中偏左 |
| OrderLine | +quantity, +unitPrice | （未提供） | Order 的组成部分 |
| Product | +name, +price | （未提供） | |
| Customer | （未提供） | （未提供） | |
| VIPCustomer | （未提供） | （未提供） | 继承 Customer |

> 说明：用户未提供属性/方法的类型与方法签名参数，按 UML 允许的省略写法处理（仅标注可见性 `+`），不编造类型。

## 关系

| 起点 | 关系类型 | 终点 | 多重性 | 画法 |
|---|---|---|---|---|
| Order | Composition（组合） | OrderLine | Order 端 1，OrderLine 端 1..* | 实线 + 实心菱形在 Order 端 |
| OrderLine | Association（关联） | Product | Product 端 1 | 实线（另一端多重性用户未给，不标注） |
| Order | Association（关联） | Customer | Customer 端 1 | 实线（Order 端为整体侧，不标） |
| VIPCustomer | Generalization（继承） | Customer | — | 实线 + 空心三角箭头指向 Customer |

## 布局

- 画布 1200×675（16:9），Claude 风（暖米白底 #F5F1EA、赭橙 #D97757 强调）。
- Order（左上核心）→ 右：OrderLine → 右：Product（组合/关联横向主轴）。
- Order ↓ Customer ↓ VIPCustomer（关联与继承纵向轴，父类在上、子类在下）。
- 无接口；无需 «interface» 标注。图例放右下角说明菱形/三角/实线语义。
