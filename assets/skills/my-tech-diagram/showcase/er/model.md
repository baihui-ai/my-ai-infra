# 关系模型：order-er-crowsfoot（ER 图，Crow's Foot 记号）

来源：用户任务直接给定，未编造任何实体/属性/关系。

## 实体（均为「表」类型节点）

| 实体 | 属性（顺序即图中行序） | PK | FK |
|---|---|---|---|
| users | id, name, email | id | — |
| orders | id, user_id, status, created_at | id | user_id → users.id |
| order_items | id, order_id, product_id, quantity | id | order_id → orders.id；product_id → products.id |
| products | id, name, price | id | — |

说明：用户未给属性类型，图中只列属性名 + PK/FK 标记，不编造类型。

## 关系（Crow's Foot 端点）

| 关系 | 动词短语 | 一端（父） | 多端（子） |
|---|---|---|---|
| users — orders | places | users 端 `||`（exactly one） | orders 端 `O<`（zero or many） |
| orders — order_items | contains | orders 端 `||` | order_items 端 `O<` |
| products — order_items | appears in | products 端 `||` | order_items 端 `O<` |

假设标注（门禁已满足，以下为常规约定而非缺口）：
- 可选性：用户只给了 1-N，未给可选性。按电商领域常规取「子端 zero or many（O<）、父端 exactly one（||）」——即订单必须属于一个用户、用户可以有 0 到多个订单；order_items 同理。
- 动词短语 places / contains / appears in 为行业惯用命名，仅作关系标注，不改变用户给定的结构。
- 无多对多关系，无需拆中间表（order_items 本身即 orders×products 的关联表，但用户按 1-N 给出，按其表述画）。

## 布局

2×2 网格，无连线交叉：
- 左上 users → 右上 orders（水平线）
- orders ↓ order_items（垂直线）
- 左下 products → 右下 order_items（水平线）

## 风格

简洁风（minimal）：任务指定，且为 Skill 默认。白底、黑白灰 + 蓝色强调 #2563EB（仅用于 PK/FK 标记）、连线 #9CA3AF。
