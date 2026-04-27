# Design Specification

> "Sales Hit Record Highs, Yet Shop Vacancy Rates Climb: The Struggle Behind Market Prosperity"  
> v1.1 · 2026-04-26 · Visual design spec only — no tech stack content

---

## 1. Design Direction

**Tone**: Serious editorial data journalism. Think Reuters Graphics, SCMP interactive features. Quiet, authoritative, letting the data speak.

**Core visual concept**: "Contradictory divergence" — red and blue as two opposing forces that collide and split apart throughout the page. The reader scrolls through apparent prosperity and gradually discovers the hidden distress underneath.

**Signature moment**: The profit waterfall chart where the green "net profit" bar is almost invisible — out of every $100 in sales, only $3.2 remains.

---

## 2. Narrative Structure

| Section | Title (Chinese) | Core message | Primary chart |
|---------|-----------------|--------------|---------------|
| Hero | 銷售額創新高，商鋪空置率卻攀升 | Headline contradiction + 3 KPIs | — |
| §1 Surface prosperity | 銷售額強勁反彈 | Sales are genuinely rising | Monthly sales line chart |
| §2 Undercurrent | 商鋪空置率同步攀升 | But shops are going empty | Vacancy bar chart (4 districts) |
| Insert | Core insight callout | Name the paradox | — |
| §3 Root cause | 三重壓力擠壓利潤 | Costs devour profit | Cost squeeze diagram + profit waterfall |
| §4 Divergence | 兩條曲線的背離 | Bird's-eye view of the split | Dual-axis divergence chart |
| Conclusion | 銷售額 ≠ 商戶盈利 | Three key takeaways | Three conclusion cards |

---

## 3. Design Tokens

### 3.1 Colors

```
Backgrounds
  --c-bg              #F7F5F0       Main background (warm off-white)
  --c-bg-dark         #1A1714       Dark blocks (insight callout)
  --c-bg-warm         #F0EBE1       Conclusion section background

Text
  --c-text            #1A1714       Primary text
  --c-text-light      #6B6560       Secondary text
  --c-text-muted      #9E9790       Captions, annotations

Semantic — "up / positive-looking"
  --c-accent-up       #C8372D       Red → sales, growth
  --c-accent-up-light rgba(200,55,45,0.08)

Semantic — "down / negative"
  --c-accent-down     #2D6BC8       Blue → vacancy, decline
  --c-accent-down-light rgba(45,107,200,0.08)

Semantic — "warning / cost pressure"
  --c-accent-warn     #D4890A       Amber → cost items
  --c-accent-warn-light rgba(212,137,10,0.08)

Semantic — "profit"
  --c-green           #2D8C5A       Green → net profit (used ONCE in entire page)
  --c-green-light     rgba(45,140,90,0.08)

Borders
  --c-border          #DDD8D0
  --c-border-light    #EBE7E0
```

**Color discipline**: Red, blue, amber, and green each serve exactly one semantic role. Green intentionally appears only on the final waterfall bar — kept "pathetically small" to maximize visual impact.

### 3.2 Typography

```
--font-serif    'Noto Serif SC', 'Source Han Serif SC', 'SimSun', serif
--font-sans     'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif
```

| Usage | Font | Weight | Size |
|-------|------|--------|------|
| Hero headline | serif | 900 | clamp(32px, 5vw, 56px) |
| Section title | serif | 700 | clamp(24px, 3.5vw, 36px) |
| Chart title | serif | 700 | 18px |
| Body text | sans | 400 | 17px · line-height: 2 |
| KPI numbers | serif | 900 | 36px |
| In-chart numbers | serif | 700 | 14px |
| Annotations | sans | 400–500 | 12–13px |
| Source / meta | sans | 400 | 11–13px |

### 3.3 Spacing Scale

```
4    Micro (chart annotation internals)
8    Element internals
12   Label-to-content gap
16   Small paragraph gap
24   Paragraph spacing
32   Container padding (left/right)
40   Chart card padding
48   Between section elements
64   Between large blocks
80   Between sections
```

### 3.4 Layout Widths

```
--w-max       960px      Page max width
--w-narrow    720px      Reading column width
--w-chart     840px      Chart card width
```

---

## 4. Component Specs

### 4.1 TopBar

Fixed to top. Background `rgba(247,245,240,0.85)` + `backdrop-filter: blur(12px)`. Hides on scroll-down, reveals on scroll-up. Left: brand name (serif 700, 15px, letter-spacing 2px). Right: red tag "深度調查" + date. Reading progress bar attached at very top — gradient from red to blue, width tracks scroll percentage.

### 4.2 Hero

Full viewport height. Background has two oversized radial gradients (red at 4% opacity upper-left, blue at 4% lower-right) for subtle atmosphere.

Components:
- Meta line: category + column label (13px, muted, letter-spacing 3px)
- Headline: "創新高" in red, "攀升" in blue
- Subtitle: gray serif
- Three KPI cards: 3px left border in semantic color (red / blue / amber)
- Bottom scroll hint: gentle bounce animation, fades out with scroll

### 4.3 Section Divider

Centered 44×44px circle, 1px border, chapter number inside (serif 16px 700). Horizontal line passes behind the circle. Spacing: 80px top, 60px bottom.

### 4.4 Chart Block

White card. 1px `--c-border-light` border, 8px radius. 40px padding. Top: title (serif 700 18px) + subtitle (13px muted). Bottom: source line (11px muted) with 1px separator above. Legend uses colored dots/lines + text in flex layout.

### 4.5 Insight Callout

Dark background `--c-bg-dark`. Red and blue radial gradients overlaid. Text in serif `clamp(20px, 3vw, 28px)`, white. Keywords highlighted in bright red (`#F07068`) and bright blue (`#6BA3E8`). Padding 56px 48px.

### 4.6 Conclusion Cards

Three-column grid. White cards with 3px top border in semantic color (red / amber / blue). Large number (serif 900 40px) + title + description paragraph.

### 4.7 Methodology

White card at narrow width. Title in uppercase, letter-spacing 2px. Body 14px `--c-text-light`.

---

## 5. Chart Specifications

### Universal Rules

- Axes: 1px `--c-border-light`
- Grid lines: dashed (4 4), 0.5px
- Axis labels: 12px sans, muted color
- Lines: 2.5px, round cap, round join
- Highlight dots: double-layer (outer r=6 semi-transparent, inner r=3.5 solid)
- Annotation bubbles: rounded rect rx=4, filled with semantic color, white text 12px

### §1 — Monthly Sales Line Chart

Monthly time series (2019-01 to 2026-02). Y-axis in HK$ billions (0–400). COVID period (2020–2022) shown as light gray background block with text label. Feb 2026 peak gets a red annotation bubble "$342億". COVID low point gets gray "低位" label. Optional hover tooltip. Animation: path draws left-to-right over 1.5s.

### §2 — Vacancy Rate Comparison Bars

Horizontal grouped bar chart. Four districts (Mong Kok, Causeway Bay, Tsim Sha Tsui, Central), each with two rows: top row blue (2026 Q1), bottom row gray semi-transparent (2025 Q1). Bar height 28px, 4px radius. Right-side value in serif 700 14px. Animation: width expands from 0, duration 1.2s.

### §3a — Cost Squeeze Diagram

Conceptual diagram, not a precise data chart. Three-column grid: left (sales +16.2%) → center arrow (labeled "被抵消") → right (three cost cards with emoji icons and amber values). Cards lift on hover. Mobile: single column, arrow rotates 90°.

### §3b — Profit Waterfall Chart

Six bars: Sales $100 (red, 240px tall) → COGS -$42 → Rent -$28 → Labor -$18 → Utilities -$8.8 (amber, opacity decreasing 0.8→0.5) → Net Profit $3.2 (green, only 8px tall). Bar width 56px, top-rounded. Below: amber warning badge "利潤率僅 3.2%". Animation: bars rise sequentially, 120ms delay each.

### §4 — Dual-Axis Divergence Chart

Dual Y-axis line chart (annual, 2019–2026). Left axis: sales index (red scale, 40–120). Right axis: vacancy rate % (blue scale, 4%–20%). Gradient-filled area between the two lines (red-tinted above, blue-tinted below) creates a "spreading scissors" visual. At 2026: dashed line connecting the two endpoints + dark bubble labeled "背離". Animation: both lines draw simultaneously + fill fades in.

---

## 6. Motion Specifications

### Scroll Reveal

Elements transition from `opacity:0; translateY(36px)` to normal state on viewport entry. Duration 0.8s, easing `cubic-bezier(0.23,1,0.32,1)`. Sibling elements support staggered delay at N × 120ms. Trigger threshold 15%, bottom margin -40px. Respects `prefers-reduced-motion`.

### Chart Animations

Triggered on viewport entry (threshold 30%), fire once only.

| Chart | Animation | Duration | Delay |
|-------|-----------|----------|-------|
| Sales line | stroke-dashoffset path draw | 1.5s | — |
| Vacancy bars | width expansion | 1.2s | — |
| Profit waterfall | height rise | 1.0s | +120ms per bar |
| Divergence | path draw + area fade-in | 1.5s + 0.8s | — |

### Other Motion

- TopBar: hides/shows based on scroll direction, transition 0.3s
- Hero scroll hint: bounce 2s infinite, linear fade-out with scrollY
- Reading progress bar: width = scrollY / total document height
- Cost cards hover: translateY(-2px) + shadow increase

---

## 7. Responsive Breakpoints

**≤ 768px (tablet / phone)**
- Hero KPI row → vertical stack
- Cost squeeze diagram → single column, arrow rotates 90°
- Conclusion cards → single column
- Chart card padding → 24px 20px
- Insight callout padding → 40px 28px
- Waterfall bar width → 40px

**≤ 480px (small phone, optional)**
- Hero headline min 28px
- Charts simplify to key data points only
- Bar chart labels move from left to above

---

## 8. Data Structures

All data lives in separate JSON files for easy real-data replacement. Current values are placeholder/simulated.

### sales.json

```json
{
  "unit": "億港元",
  "series": [
    { "date": "2019-01", "value": 340 },
    { "date": "2026-02", "value": 342 }
  ],
  "annotations": [
    { "date": "2026-02", "label": "$342億", "type": "highlight" },
    { "range": ["2020-01", "2022-06"], "label": "疫情期間", "type": "shading" }
  ]
}
```

### vacancy.json

```json
{
  "unit": "%",
  "districts": [
    {
      "name": "旺角",
      "current": { "period": "2026Q1", "value": 17.2 },
      "previous": { "period": "2025Q1", "value": 12.4 }
    }
  ]
}
```

### costs.json

```json
{
  "revenue_growth": 16.2,
  "costs": [
    { "category": "租金", "growth": 23.5, "icon": "🏢" },
    { "category": "人工", "growth": 12.8, "icon": "👥" },
    { "category": "物料及物流", "growth": 9.4, "icon": "📦" }
  ],
  "waterfall": [
    { "label": "銷售額", "value": 100, "type": "income" },
    { "label": "貨品成本", "value": -42, "type": "cost" },
    { "label": "租金", "value": -28, "type": "cost" },
    { "label": "人工", "value": -18, "type": "cost" },
    { "label": "水電雜費", "value": -8.8, "type": "cost" },
    { "label": "淨利潤", "value": 3.2, "type": "profit" }
  ]
}
```

### divergence.json

```json
{
  "base_year": 2019,
  "series": [
    { "year": 2019, "sales_index": 100, "vacancy_rate": 5.8 },
    { "year": 2020, "sales_index": 62,  "vacancy_rate": 8.2 },
    { "year": 2026, "sales_index": 112, "vacancy_rate": 14.6 }
  ]
}
```

---

## 9. Accessibility

- All charts carry `aria-label` with a data summary
- Color contrast meets WCAG AA
- Decorative SVG elements marked `aria-hidden="true"`
- Semantic HTML: `<section>`, `<figure>`, `<figcaption>`
- Animations respect `prefers-reduced-motion: reduce`
