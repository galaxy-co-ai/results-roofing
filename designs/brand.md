# Results Roofing — Brand Brief

## Identity

- **Type:** Instant roof replacement quote platform (SaaS + customer-facing)
- **Personality:** Trustworthy, professional, efficient, approachable, data-forward
- **Audience:** Self-pay homeowners needing roof replacement quotes
- **Key Flow:** Address → Satellite measurement → Package selection → Checkout

## Colors

| Role | Value | Notes |
|------|-------|-------|
| Primary (Brand Blue) | `#2563EB` | CTAs, links, focus rings |
| Foreground (Charcoal) | `#1E2329` | Primary text |
| Background (Soft White) | `#F7F9FC` | Cool undertone page bg |
| Card | `#FFFFFF` | Clean white cards |
| Border | `#E8EDF5` | Cool gray dividers |
| Success | `#10B981` | Confirmations, positive status |
| Warning | `#F59E0B` | Alerts, pending states |
| Destructive | `#EF4444` | Errors, cancellations |

### Dark Theme

| Role | Value |
|------|-------|
| Background | `#0F1419` |
| Foreground | `#F7F9FC` |
| Card | `#1E2329` |
| Border | `#2A3038` |

## Typography

| Element | Font | Notes |
|---------|------|-------|
| All text | System stack | -apple-system, Segoe UI, Roboto |
| Mono | SF Mono, Fira Code | Code/data display |

### Typography Scale (Geist-inspired)

- Heading sizes: `clamp()` responsive
- Metric display: tabular-nums, large weight
- Label: 11-12px, uppercase tracking

## Visual Identity

- Clean, professional, Vercel-adjacent aesthetic
- Recharts for data visualization
- Border radius: `6px`
- Neumorphic shadow approach (warm-calibrated)
- Dashboard-optimized layouts

## References

- Vercel dashboard clarity
- Stripe checkout flow (trust signals)
- Modern SaaS quote tools

## Pencil Token Mapping

```
$--background    → #F7F9FC            soft white (cool)
$--foreground    → #1E2329            charcoal
$--card          → #FFFFFF            clean white
$--primary       → #2563EB            brand blue
$--secondary     → #F2F4F8            light gray
$--muted-foreground → #6B7280         medium gray
$--border        → #E8EDF5            cool gray
$--accent        → #2563EB            same as primary
$--destructive   → #EF4444            danger red
$--color-success → #10B981            green
$--color-warning → #F59E0B            amber
$--color-error   → #EF4444            red
$--font-primary  → system-ui
$--font-secondary → system-ui
$--radius-m      → 6px
$--radius-pill   → 9999px
```
