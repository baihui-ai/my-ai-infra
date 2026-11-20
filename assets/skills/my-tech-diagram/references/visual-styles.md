# SVG 视觉风格规范（LLM 手写 SVG 专用）

> 供按需加载。目标：LLM 直接手写 SVG 时套用统一的视觉语言。
> 下方历史片段用于示意色板与基本构件，尺寸/字号必须按上方通用规则与实际展示宽度重新计算，不能直接照搬小画布数值。
> 默认汇报基线 reporting；五套可选外观：**minimal（简洁风）/ claude（Claude 风）/ tech（科技炫酷风）/ animated（动画风）/ sticky（便签风）**。
> 先读「通用质量规则」，再按需求加载对应风格节。

---

## 0. 通用 SVG 质量规则（所有风格必读）

### viewBox 与尺寸
- 始终显式设置 `viewBox="0 0 W H"`，不写 `width/height` 像素值（由外层容器缩放），或写 `width="100%"`。
- **画布服从内容**：汇报类可优先 16:9，但不强制所有图宽屏。先计算卡片、分组和文字尺寸，再确定 viewBox。领域模型和领域事件保持单张完整图，内容多时同图分区换行或扩大画布，不拆详图、不压缩字号。
- **以目标展示尺寸验收**：例如 1600px 画布显示在 1000px 宽的文档中，14px 字会缩到约 9px；应增大字体并重新布局。目标阅读宽度下正文建议至少 14px、辅助信息至少 12px；密集大图可提供原尺寸缩放查看，但不能声称缩略图同样清晰。
- 画布留白：四周至少 24px padding；内容不贴边。
- 节点标准尺寸基准：矩形节点宽 160-200、高 48-64；节点间距水平 ≥ 60、垂直 ≥ 40（防重叠的最小间距）。

### 对齐与视觉平铺（美观的硬规则）
- **同类节点统一尺寸**；节点对齐到隐形网格（建议 20 或 40px 网格），同行节点顶部对齐、同列节点中心对齐。
- **间距一致**：同层级的水平间距取同一值，垂直间距取同一值；成组元素等距平铺，不靠肉眼随意摆放。
- 视觉重心居中：整图内容在画布中水平居中；标题左对齐或居中，全图统一。
- 颜色克制：一张图主色 + 强调色 ≤ 3 种（语义配色图如事件风暴除外，但也须出自所选风格色板的映射）。
- **元素类型文字标注**：图中元素有不同语义类型时（如命令/事件、Entity/ValueObject、Container/外部系统），每个节点上必须有小字类型标注（按展示尺寸可读、次要色、放在名称上方或下方一行），不能只靠颜色/形状区分——颜色会随风格主题变化，文字标注不丢语义。

### 文字不溢出（关键）
- 宽度估算：**中文每字 ≈ 1em，英文/数字每字符 ≈ 0.55em**（system-ui 基准）。节点文字宽度按中文、英文分别估算后相加；例如单类字符宽度 = 字符数 × em × font-size，盒子内宽须 ≥ 文字宽 + 2×12px 内边距。
- 例：`font-size:14`，「数据校验服务」= 6 字 × 14 = 84px，盒宽至少 84+24 = 108px。
- 超长处理：优先缩短文案（≤8 字）；其次换行（`<tspan>` 分行，行高 1.3em）；不要通过缩小字号满足固定卡片尺寸，优先加宽卡片或按词边界换行。
- 短卡片标签可居中；分区标题、长说明可左对齐。多行文字按实际行高布局，不能把所有 text 强制放在几何中心；必要时在浏览器用 getBBox/getComputedTextLength 测量。

### 箭头 marker 定义（统一模板）
```svg
<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M 0 0 L 10 5 L 0 10 z" fill="CURRENT_COLOR"/>
</marker>
```
- 仅有方向语义的连线使用 `marker-end="url(#arrow)"`；双向箭头用 `orient="auto-start-reverse"` + `marker-start`。领域模型关联线用两端多重性，默认无箭头/菱形；分组领域事件图完全不画关系线，不定义箭头。
- 连线终点在节点边缘处收短 2px（`refX="9"` 已含箭头补偿，别让箭头插进节点里）。
- 虚线约定：异步/可选/引用关系用 `stroke-dasharray="6 4"`；实线 = 主流程。

### font-size 层级
| 层级 | 大小 | 用途 |
|---|---|---|
| 标题 | 20-24px / 600 | 图标题 |
| 节点主标签 | 16-18px / 500 | 节点名（按展示缩放调整） |
| 次要说明 | 13-14px / 400 | 类型、说明、连线标签 |
| 脚注 | 12px / 400 | 图例、注释（以展示后可读为准） |

### 其他
- 字体栈统一（中西文回退）：`font-family="system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"`。
- 不用外部字体、不用 `<foreignObject>`（兼容性差）。
- 连线优先横平竖直折线（orthgonal），转弯半径 8px 或直接直角；斜线仅用于极简两点直连。
- **连线不相交（所有流程类图的硬规则）**：画线前规划通道——回流线走画布外缘，多线汇入同一节点时在不同高度分别汇入后共用末段；确实无法避免交叉时，用跳线（交叉处画小半圆拱）表达跨越。发现交叉优先调整节点位置。
- 图例（legend）放右上角或底部，说明线型/颜色语义。

---

## 默认：汇报风 reporting（所有图）

- 目标是会议/文档展示：标题说明图的主题，副标题可写范围或一句已确认结论；不虚构结论或添加营销文案。图例与必要来源放底部。
- 背景白或暖白 `#FFFFFF/#FAFAF8`，主文字 `#20252B`，次文字 `#596575`，分区浅灰 `#F3F5F7`，边界 `#D7DEE5`，主强调蓝 `#3568A8`。不同语义需不同颜色时固定图例，不为统一蓝色覆盖事件图的黄命令/绿事件/粉标题。失败路径用克制红色或线型+标签区分。
- 在约1200px阅读宽度下：标题约28–32px，分区标题20–22px，节点16–18px，说明/线标至少12–14px。画布更宽时等比增大字号/间距，或支持原尺寸查看；不能以缩略图冒充清晰汇报图。16:9适合内容量允许的汇报，复杂模型先保持完整与可读，不拆局部详图。
- 四周留白32–48px，8px间距网格；节点内边距16px，标签和边界间留出空间。分区有明确标题，主/次路径层次可辨，连线不穿字。
- 领域事件用下面的便签样式并按汇报字号放大：保留折角和固定语义色，不加流程连线。模型/ER/类图用轻卡片；时序图保留生命线/消息箭头/alt等图型语义，不能用统一卡片替换所有记号。
- 默认不加光晕、霓虹、重阴影、网格纹理或动画。用户显式选科技/Claude等外观时，仍遵守文字可读、关键路径完整及图型语义。
- 必须实际渲染后以目标展示宽度查看；检查完整性、长标签与异常分支，必要时局部放大检查。发现拥挤先重排，不删业务事实或失败恢复路径。无法预览就说明验证限制。

---

## 1. 简洁风 minimal

> 对标：C4 官网图、Google Cloud 架构图、论文插图。白底、黑白灰 + 单一强调色。
> 适用：文档插图、技术方案评审、任何「不知道用什么就用它」的默认场景。

### 色板

| 用途 | Hex |
|---|---|
| 背景 | `#FFFFFF` |
| 主文字 | `#1F2328` |
| 次要文字 | `#6B7280` |
| 节点填充 | `#FFFFFF`（描边 `#D1D5DB`）或 `#F9FAFB` |
| 强调色（仅一种） | `#2563EB`（蓝，首选）或 `#059669`（绿） |
| 强调色浅底 | `#EFF6FF` |
| 连线 | `#9CA3AF`，关键路径用强调色 |

### 规范
- 圆角 `rx="8"`；**无阴影**或极轻 `filter`（`feDropShadow dy=1 stdDeviation=2 flood-opacity=0.08`）。
- 线宽：节点描边 1.5px，连线 1.5px，强调 2px。
- 间距基准 8px 网格（8/16/24/32/48）。

### SVG 片段示例
```svg
<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,'PingFang SC','Microsoft YaHei',sans-serif">
  <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" fill="#9CA3AF"/></marker></defs>
  <rect width="480" height="240" fill="#FFFFFF"/>
  <rect x="40" y="88" width="150" height="56" rx="8" fill="#FFF" stroke="#D1D5DB" stroke-width="1.5"/>
  <text x="115" y="122" text-anchor="middle" font-size="14" font-weight="500" fill="#1F2328">订单服务</text>
  <rect x="290" y="88" width="150" height="56" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5"/>
  <text x="365" y="122" text-anchor="middle" font-size="14" font-weight="500" fill="#2563EB">支付网关</text>
  <line x1="190" y1="116" x2="288" y2="116" stroke="#9CA3AF" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="240" y="106" text-anchor="middle" font-size="11" fill="#6B7280">HTTP</text>
</svg>
```

---

## 2. Claude 风 claude

> 对标：Anthropic / Claude 品牌视觉。暖米白底、赭橙主色、衬线标题感、克制排版。
> 适用：面向 Claude 生态的文档、分享材料、想要「温润书卷气」的场景。

### 色板

| 用途 | Hex |
|---|---|
| 背景 | `#F5F1EA`（暖米白） |
| 卡片/节点底 | `#FDFBF7` |
| 主色（赭橙） | `#D97757` |
| 主色深（hover/强调文字） | `#C2542F` |
| 主文字（暖黑） | `#2B2118` |
| 次要文字 | `#8A7B6B` |
| 描边 | `#E3DCD0` |

### 规范
- 标题用衬线栈：`font-family="Georgia, 'Times New Roman', 'Songti SC', 'SimSun', serif"`，节点正文仍用无衬线栈。
- 圆角 `rx="10"`（比 minimal 略圆润）；阴影极轻或无。
- 线宽 1.5px；连线用 `#C9BFAE` 暖灰，箭头用主色 `#D97757`。
- 强调手法：节点顶部 3px 主色条，或节点名用主色，避免大面积填充橙色。

### SVG 片段示例
```svg
<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,'PingFang SC','Microsoft YaHei',sans-serif">
  <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" fill="#D97757"/></marker></defs>
  <rect width="480" height="240" fill="#F5F1EA"/>
  <text x="40" y="44" font-size="20" font-weight="600" fill="#2B2118" font-family="Georgia,'Songti SC',serif">检索流程</text>
  <rect x="40" y="88" width="150" height="58" rx="10" fill="#FDFBF7" stroke="#E3DCD0" stroke-width="1.5"/>
  <rect x="40" y="88" width="150" height="4" rx="2" fill="#D97757"/>
  <text x="115" y="124" text-anchor="middle" font-size="14" font-weight="500" fill="#2B2118">查询解析</text>
  <rect x="290" y="88" width="150" height="58" rx="10" fill="#FDFBF7" stroke="#E3DCD0" stroke-width="1.5"/>
  <text x="365" y="124" text-anchor="middle" font-size="14" font-weight="500" fill="#2B2118">向量召回</text>
  <line x1="190" y1="117" x2="288" y2="117" stroke="#C9BFAE" stroke-width="1.5" marker-end="url(#arr)"/>
</svg>
```

---

## 3. 科技炫酷风 tech

> 对标：深色底 DevOps/监控大盘图、GitHub Dark (#0D1117)、霓虹强调。
> 适用：演示 PPT、大屏、营销页插图。**不用于打印与严肃评审**（深色打印效果差）。

### 色板

| 用途 | Hex |
|---|---|
| 背景 | `#0D1117` |
| 网格线 | `#1C2330` |
| 节点底 | `#161B22`（描边 `#30363D`） |
| 主文字 | `#E6EDF3` |
| 次要文字 | `#8B949E` |
| 霓虹强调 1（青） | `#22D3EE` |
| 霓虹强调 2（紫） | `#A78BFA` |
| 告警/关键路径 | `#F472B6` |

### 规范
- 发光效果（glow）：`filter` 用 `feGaussianBlur` 做彩色光晕，**只用在强调节点/关键路径**，全图发光会糊。
- 网格背景：`<pattern>` 画 24px 点阵或线阵，透明度 ≤ 0.5，克制。
- 圆角 `rx="10"`；描边 1.5px，强调描边 2px 用霓虹色；连线 `#3D4450`，强调连线用霓虹色 + glow。
- 同图霓虹色不超过 2 种（青 + 紫）；渐变仅用于强调元素（`linearGradient` 青→紫）。

### SVG 片段示例
```svg
<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,'PingFang SC','Microsoft YaHei',sans-serif">
  <defs>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0 H0 V24" fill="none" stroke="#1C2330" stroke-width="0.5"/></pattern>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#22D3EE"/></marker>
  </defs>
  <rect width="480" height="240" fill="#0D1117"/>
  <rect width="480" height="240" fill="url(#grid)"/>
  <rect x="40" y="88" width="150" height="56" rx="10" fill="#161B22" stroke="#30363D" stroke-width="1.5"/>
  <text x="115" y="122" text-anchor="middle" font-size="14" fill="#E6EDF3">采集器</text>
  <rect x="290" y="88" width="150" height="56" rx="10" fill="#161B22" stroke="#22D3EE" stroke-width="2" filter="url(#glow)"/>
  <text x="365" y="122" text-anchor="middle" font-size="14" fill="#22D3EE">流处理</text>
  <line x1="190" y1="116" x2="288" y2="116" stroke="#22D3EE" stroke-width="1.5" marker-end="url(#arr)"/>
</svg>
```

---

## 4. 动画风 animated

> 在以上任一风格基础上叠加 SVG 内嵌动画。用于演示「数据在流动」的叙事场景。

### 技术选型：SMIL vs CSS @keyframes

| 维度 | SMIL（`<animate>` / `<animateMotion>`） | CSS `@keyframes` |
|---|---|---|
| 浏览器支持 | Chrome/Firefox/Safari/Edge 全支持（IE 不支持，已无妨） | 全支持 |
| 独立 .svg 文件 / `<img>` 引用 | **可用**（自包含，首选） | 不可用（`<img>` 内不跑外部/内联 CSS 动画；内嵌 `<style>` 在多数浏览器可行但不可靠） |
| 沿路径运动 | `animateMotion` 原生支持 | `offset-path`，Safari 17+/Firefox 122+ 才稳定 |
| 链式时序 | `begin="a.end"` 原生 | 手算 `animation-delay` |
| `prefers-reduced-motion` 无障碍 | 需 JS | `@media` 一行搞定 |
| 性能 | 一般 | transform/opacity 走合成器，更流畅 |

**决策**：产出独立 .svg 文件 → SMIL；嵌入 HTML 页面 → CSS @keyframes（记得加 `prefers-reduced-motion` 兜底）。不确定时用 SMIL。

### 常用动画模式

| 模式 | 实现 | 用途 |
|---|---|---|
| 虚线流动 | `stroke-dasharray` + 动画 `stroke-dashoffset` | 数据流方向（最常用） |
| 路径绘制 | `stroke-dasharray = 路径总长`，offset 从总长 → 0 | 连线「生长」出场 |
| 节点脉冲 | 动画 `opacity` 或外层圆环 `r` 扩散 + 淡出 | 活跃节点心跳 |
| 沿路径移动 | `animateMotion` + `mpath` | 数据包/消息流转 |

### SMIL 片段示例（虚线流动 + 数据包 + 节点脉冲）
```svg
<svg viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,'PingFang SC',sans-serif">
  <rect width="480" height="200" fill="#0D1117"/>
  <rect x="40" y="72" width="140" height="52" rx="10" fill="#161B22" stroke="#30363D"/>
  <text x="110" y="103" text-anchor="middle" font-size="14" fill="#E6EDF3">生产者</text>
  <rect x="300" y="72" width="140" height="52" rx="10" fill="#161B22" stroke="#30363D"/>
  <text x="370" y="103" text-anchor="middle" font-size="14" fill="#E6EDF3">消费者</text>
  <circle cx="370" cy="72" r="5" fill="#22D3EE">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/></circle>
  <path id="p1" d="M180 98 H300" fill="none" stroke="#22D3EE" stroke-width="1.5" stroke-dasharray="6 4">
    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite"/></path>
  <circle r="4" fill="#A78BFA">
    <animateMotion dur="2s" repeatCount="indefinite"><mpath href="#p1"/></animateMotion></circle>
</svg>
```

### CSS @keyframes 等价写法（嵌 HTML 时）
```svg
<style>
  .flow { stroke-dasharray: 6 4; animation: dash 0.8s linear infinite; }
  @keyframes dash { to { stroke-dashoffset: -20; } }
  @media (prefers-reduced-motion: reduce) { .flow { animation: none; } }
</style>
<path class="flow" d="M180 98 H300" fill="none" stroke="#22D3EE" stroke-width="1.5"/>
```

### 动画约束
- 同时动画元素 ≤ 10 个；`dur` 取 0.8s / 1.6s / 2s 等整齐值；一律 `repeatCount="indefinite"` 循环。
- 动画只用于「强调流向/活跃状态」，不为装饰而动画。
- 静态降级：动画删掉后图必须依然成立（虚线流动 → 静态虚线 + 箭头）。

---

## 5. 便签风 sticky

> 对标：Event Storming 工作坊便利贴墙。事件风暴图的天然搭配，也适合头脑风暴、盘点类图。
> 参考实物：`../assets/event-storming-cn-grouped.png`（黄命令 / 绿事件 / 粉分组头）。先查看图片，再按目标阅读尺寸重新排版。

### 色板

| 用途 | Hex |
|---|---|
| 背景 | `#FFFFFF`（或极浅灰 `#FAFAFA`） |
| 命令便签 | 底 `#FFF3BF`，边 `#E8B004` |
| 事件便签 | 底 `#D3F9D8`，边 `#5C940D` |
| 分组标题条 | 底 `#FCE4EC`，边 `#AD1457` |
| 参与者便签 | 底 `#FFF9DB`，边 `#B08C00`（比命令更浅的黄，小尺寸） |
| 外部系统便签 | 底 `#FCE4EC`，边 `#C2255C`，虚线边 |
| 主文字 | `#343A40` |
| 类型小字标注 | `#868E96` |

### 规范
- 便签 = 正方形或近正方形（宽 ≈ 高，如 120×96），右上角**折角 dog-ear**：用深色小三角 path 表达（`M x y h -14 v 14 z` 类）。
- 可加极轻的 `transform="rotate(±0.8deg)"` 制造手工感——同一张图内角度交错但 ≤1°，避免歪到难读；正式交付可不旋转。
- 无边框阴影或极轻投影（`filter` 2px 偏移、10% 黑）。
- 文字：名称建议 16px/600 居中；类型标注（命令/事件）至少 12px 放名称上方一行——**文字标注是必须项，颜色只是辅助**。
- 连线：领域事件分组图禁止任何关系连线与箭头；其他便签用途仅在关系有方向语义时画细箭头。

### SVG 片段示例（一张命令便签 + 一张事件便签 + 分组标题条）
```svg
<svg viewBox="0 0 560 220" xmlns="http://www.w3.org/2000/svg"
     font-family="system-ui,'PingFang SC','Microsoft YaHei',sans-serif">
  <rect width="560" height="220" fill="#FFFFFF"/>
  <!-- 分组标题条 -->
  <rect x="24" y="20" width="512" height="40" rx="4" fill="#FCE4EC" stroke="#AD1457" stroke-width="1"/>
  <text x="280" y="45" text-anchor="middle" font-size="14" font-weight="600" fill="#880E4F">线索模块</text>
  <!-- 命令便签（黄） -->
  <g>
    <rect x="40" y="92" width="120" height="96" rx="3" fill="#FFF3BF" stroke="#E8B004" stroke-width="1.2"/>
    <path d="M146 92 h14 v14 z" fill="#E8B004" opacity="0.55"/>
    <text x="100" y="118" text-anchor="middle" font-size="10" fill="#868E96">命令</text>
    <text x="100" y="146" text-anchor="middle" font-size="13" font-weight="600" fill="#343A40">创建线索</text>
  </g>
  <!-- 事件便签（绿） -->
  <g>
    <rect x="190" y="92" width="120" height="96" rx="3" fill="#D3F9D8" stroke="#5C940D" stroke-width="1.2"/>
    <path d="M296 92 h14 v14 z" fill="#5C940D" opacity="0.55"/>
    <text x="250" y="118" text-anchor="middle" font-size="10" fill="#868E96">事件</text>
    <text x="250" y="146" text-anchor="middle" font-size="13" font-weight="600" fill="#343A40">线索已创建</text>
  </g>
</svg>
```

---

## 渲染与视觉验收

- 先核对关系模型的节点、关系/配对与分组清单，避免“排版整齐但内容遗漏”。
- 使用当前可用的浏览器或 SVG 渲染器打开实际文件，查看整图与局部；无需调用外部绘图生成器。不可把 XML 解析成功当作视觉验收通过。
- 检查长英文完整、中文行距、标签与边框间距、跨区关系通道、标题与图例占位。修正后重新查看。
- 领域模型不得因跨上下文拆图；领域事件不得出现箭头、连接线或隐含时间轴。卡片分隔线、标题条边框属于装饰，不算关系线。
- 文件路径缺失或工具不可用时如实报告，不能宣称已预览。

## 参考来源

- [C4 Model — 官方示例图（极简白底风格）](https://c4model.com/diagrams)
- [Google Cloud Architecture Diagramming Guide](https://cloud.google.com/architecture/diagrams)
- [AWS Architecture Icons & 风格指南](https://aws.amazon.com/architecture/icons/)
- [Style guide for AWS architecture diagrams](https://medium.com/@samjackgreen/style-guide-for-aws-architecture-diagrams-6fe7c1db8a7a)
- [CSSVG — Animated SVG: SMIL vs CSS vs React](https://cssvg.com/blog/animated-svg-guide)
- [MDN — SVG animation with SMIL](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL)
