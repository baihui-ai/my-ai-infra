# 对标网站遴选、对外事实口径与美式英文核验规范

> 来源：`docs/网页测试与对标网站规范.md`、`docs/decisions-log.md`（2026-09-22 至 2026-11-22 条目）。

---

## 一、合标对标网站遴选标准（缺一不可）

挑选对标参考站时，必须逐条过审并标明 Ahrefs 数据：

1. **美国公司优先**：默认只选美国公司（目标第一市场为美国）。
2. **美国谷歌月自然访问量 > 20,000（Ahrefs 美国口径）**：入选必须写明具体估算流量数字。理由：高自然流量证明其在互联网获客上真实投入且专业，比按营收选靠谱得多。
3. **商业模式相同**：只选**靠互联网获客、页面核心目的是让 B2B 访客留线索**的制造商／工程供应商，行业不限（如精密制造、工业零部件、紧固件、弹簧、直线运动、增材制造等）。
   - **排除**：传统不靠网站获客的巨型老厂（几十亿美元以上大企业只作个别细节备查，不作主参考）、纯零售电商、撮合平台型企业（如 Xometry）、地方小分销商。
4. **点名放行例外**：**McMaster-Carr**、**米思米（MISUMI）** 这类带在线下单的 B2B 工业品标杆可直接作为页面设计参考，不受「美国公司 / 大企业 / 带电商」限制；**亚马逊**不作页面设计参考，只允许借鉴个别交互微技巧。
5. **现代感由人眼一票否决**：一眼看上去陈旧的网站直接淘汰；**推荐对标时只给网址＋核心做法提炼，严禁发截图**（由负责人/主管自己打开看首屏拍板）。
6. **不学电话入口**：对标站常见顶部放美国免费电话，但 LILY 总部在上海，电话不作借鉴项。

**已验证可用的历史高分双轨参考池（按页面类型分轨复用并复查流量）**：
- **品牌旗舰页（首页 / About Us — 美国高精尖硬件与精密制造）**：`samsara.com`（119K）、`anduril.com`（110K）、`verkada.com`（86K）、`skydio.com`（27K）、`bostondynamics.com`（21K）、`formlabs.com`、`protolabs.com`、`igus.com`
- **目录与选型页（类目页 / 词根页 / 详情页）**：`mcmaster.com`、`us.misumi-ec.com`、`leespring.com`、`rotorclip.com`、`smalley.com`、`spirol.com`、`carrlane.com`

---

## 二、公司对外事实与品牌合规红线（全部对外页面生效）

| 维度 | 唯一合规对外口径 | 严禁出现的错误说法 |
|---|---|---|
| **品牌与他牌关系** | 销售的是 **LILY 自有品牌**；SKF / NSK / FAG / Timken / INA 等仅为**互换对标（interchange / equivalent）**，站上用 `LILY-made equivalents to ...` | 严禁写「we supply/carry SKF/NSK/FAG」「genuine（原厂正品）」或展示「Brands: 3」计数；全站品牌总页不用对方官方 Logo，只用纯文字并附免责声明 |
| **生产方式与三厂布局** | 总部在上海（闵行区元江路 525 号 6 栋 301/304/305 室）；自有工厂位于**江苏镇江（2019 年，月产 7M）、浙江慈溪（月产 2M）、河南洛阳（约 8 万）**，对外合计产能 **9M / month**；另有几十家合作工厂统一写 **`partner factories`** | 不再写「Every bearing is made by LILY」；不再写旧式「cooperative alliance factories」 |
| **市场占比口径** | 对外统一写 **`U.S. — Our largest market`**（或大字配数字 **`35 Countries`**＋副标 **`With the U.S. as our largest market`**） | 不对外写 `65%` 或 `70%` 美国占比数字（全公司含内销与亚马逊口径美国约 42%–45%）；**严禁写成 `U.S. #1`**（易被误读成“美国市场排名第一”带来夸大宣传合规风险） |
| **北美代表** | 加拿大有一位当地联系人，对外写 **`Local representative in Canada`** | 严禁写成北美/加拿大 `sales office` |
| **管理层与招聘** | 总经理英文名统一写 **`Hang Cheng`**；招聘仅限上海总部岗位，招聘邮箱保留 `lilybearing@lily-bearing.com` | 不写 `Cheng Hang`；不在工厂招人；不把招聘邮箱错改成 `sales@` |
| **质量认证与文件** | 认证：ISO 9001、AS9100D、IATF 16949（不写到具体单个料号航空级承诺）；所有工厂（含合作厂）接受验厂 | 不单独建冗余的 Quality & Certifications 长页面，证书 PDF 直接供下载；大客户供应商问卷资料走邮件附件，不在 About 页公开银行/税表 |
| **回复承诺与交易履约** | 询盘统一承诺 **`We reply within one business day`**（或 `24h reply`）；中国仓常规有价品明示 `4–8 bus. days` 与 `$200 min. online order`；美国亚马逊仓现货（`amazonInventory > 0`）仅单处绿字明示 `US Amazon Stock (N) · Ships next bus. day (1–2 days)` 且不提 `$200` 限额 | 禁止写死无数据的实时库存或瞎编交期；禁止把 `$200` 门槛套到美仓现货上 |

---

## 三、型号命名与美式英文措辞硬规矩

1. **型号命名、后缀、精度、游隙、保持架只认品牌官网原文**：经销商网站与第三方目录连线索都不当；精度统一按官方对照归档（`P0/ABEC 1 · P6/ABEC 3 · P5/ABEC 5 · P4/ABEC 7 · Above P4 · P2/ABEC 9`），无精度代号**严禁推定为 Normal**，查不到统一写「官网未给出」。
2. **首屏参数枚举原则**：可枚举选择维度（接触角、精度等级、密封、保持架）一律列出实际值和对应数量，不写模糊区间；连续量（载荷、转速、价格）才写区间；数量用大白话整句说清，不写裸 `Part numbers 263`。
3. **美式英文措辞核验法**：凡涉及关键标题、按钮、业务术语（如 `equivalent` vs `drop-in replacement` vs `cross reference`），**必须先查客户留言语料（`scripts/internet-ops/form_messages_*.py`）或美国 GSC 真实搜索词**；宣称「美国人习惯这么说」必须附真实频次数字，拿不出数字一律标「未核实」。
4. **正面制造声明与内外口径隔离（2026-11-24 定）**：大标题用正面制造直供表达（如 `Built in Our Own Factories. Supplied Direct to You.`），**禁用「Not a reseller」式否定防御开场**，把「可验厂」自然融入正文；**严禁把内部渠道／利润占比统计（如「Over 95% of our volume」）泄露为对外产品文案**；定制栏慎用「free 3D STEP CAD」等易引发过度承诺的表述，统一写 `2D/3D CAD engineering support`。
