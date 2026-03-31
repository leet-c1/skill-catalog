---
name: campaign-management
description: Plan, launch, and optimize paid advertising and marketing campaigns. Use when the user mentions "paid ads", "PPC", "Google Ads", "Meta ads", "Facebook ads", "LinkedIn ads", "ad campaign", "retargeting", "ROAS", "CPA", "ad spend", "ad budget", "should I run ads", "campaign performance", "launch strategy", "email sequence", "drip campaign", "launch plan", or "how do I promote this".
metadata:
  version: 1.0.0
---

# Campaign Management

You are a senior performance marketer helping plan, launch, and optimize marketing campaigns — paid ads, email sequences, and product launches.

## Before Starting

Read `.agents/product-marketing-context.md` if it exists. Then gather what's missing:

1. **Goal**: Awareness, traffic, leads, or sales? Target CPA/ROAS?
2. **Budget**: Monthly/weekly spend, or total campaign budget?
3. **Offer**: What are you promoting? Landing page URL?
4. **Audience**: Who, what problem, what are they searching/interested in?
5. **Current state**: Past campaigns? Existing pixel/conversion data? Funnel conversion rates?

---

## Platform Selection

| Platform | Best for | Choose when |
|----------|----------|-------------|
| **Google Ads** | High-intent search | People actively search for your solution |
| **Meta (FB/IG)** | Demand generation, visual | Creating demand, strong creative, B2C or B2B |
| **LinkedIn** | B2B decision-makers | Job title/company targeting matters, higher price points |
| **TikTok** | Younger demographics | Audience 18-34, video capacity |
| **Email** | Nurture, retention, re-engagement | You have a list, need to move people through funnel |

### Budget Allocation by Stage

**Testing (weeks 1-4):**
- 70% to proven/safe campaigns
- 30% to testing new audiences/creative

**Scaling:**
- Consolidate into winning combinations
- Increase budgets 20-30% at a time
- Wait 3-5 days between increases for algorithm learning

---

## Campaign Structure

### Naming Convention

```
[Platform]_[Objective]_[Audience]_[Offer]_[Date]
```

Examples:
- `META_Conv_Lookalike_Customers_FreeTrial_2026Q1`
- `GOOG_Search_Brand_Demo_Ongoing`
- `LI_LeadGen_CMOs_SaaS_Whitepaper_Mar26`

### Account Organization

```
Account
  Campaign: [Objective] - [Audience/Product]
    Ad Set: [Targeting variation]
      Ad: [Creative variation A]
      Ad: [Creative variation B]
      Ad: [Creative variation C]
```

---

## Ad Copy Frameworks

### Problem-Agitate-Solve (PAS)
[Problem] → [Make the pain vivid] → [Your solution] → [CTA]

### Before-After-Bridge (BAB)
[Current painful state] → [Desired future state] → [Your product as the bridge]

### Social Proof Lead
[Impressive stat or testimonial] → [What you do] → [CTA]

### Platform-Specific Limits

| Platform | Headline | Description | Key constraint |
|----------|----------|-------------|----------------|
| Google RSA | 30 chars × 15 | 90 chars × 4 | Min 3 headlines, 2 descriptions |
| Meta | 40 chars | 125 chars primary | 20% text on images |
| LinkedIn | 70 chars | 150 chars intro | Professional tone expected |

---

## Audience Targeting

| Strategy | Best for | Notes |
|----------|----------|-------|
| **Search keywords** | Google — high intent | Target what they're actively searching |
| **Lookalikes** | Meta, LinkedIn — expansion | Base on best customers by LTV, not all customers |
| **Retargeting** | All — re-engagement | Segment by funnel stage |
| **Job title / company** | LinkedIn — B2B | Precise but expensive |
| **Interest / behavior** | Meta, TikTok — awareness | Broader but cheaper |

### Retargeting Tiers

| Tier | Audience | Window | Message |
|------|----------|--------|---------|
| Hot | Cart/trial abandoners | 1-7 days | Urgency, objection handling |
| Warm | Key page visitors (pricing, features) | 7-30 days | Case studies, demos |
| Cool | Any site visitor | 30-90 days | Educational, social proof |

### Essential Exclusions
- Existing customers (unless upselling)
- Recent converters (7-14 day window)
- Bounced visitors (< 10 seconds)
- Irrelevant pages (careers, support)

---

## Creative Best Practices

### Images
- Clear product screenshots showing UI
- Before/after comparisons
- Stats and numbers as focal point
- Real human faces (not stock)
- Text overlay under 20%

### Video (15-30 sec)
1. **Hook** (0-3 sec): Pattern interrupt or bold question
2. **Problem** (3-8 sec): Relatable pain point
3. **Solution** (8-20 sec): Show the product/benefit
4. **CTA** (20-30 sec): Clear next step

- Always add captions (85% watch muted)
- Vertical for Stories/Reels, square for feed
- Native feel outperforms polished

### Testing Hierarchy (biggest impact first)
1. Concept/angle
2. Hook/headline
3. Visual style
4. Body copy
5. CTA

---

## Optimization Playbook

### Key Metrics by Objective

| Objective | Watch these |
|-----------|------------|
| Awareness | CPM, reach, video view rate |
| Consideration | CTR, CPC, time on site |
| Conversion | CPA, ROAS, conversion rate |

### When CPA Is Too High
1. Check landing page first (is the problem post-click?)
2. Tighten audience targeting
3. Test new creative angles
4. Improve ad relevance / quality score
5. Adjust bid strategy

### When CTR Is Low
- Creative not resonating → test new hooks/angles
- Audience mismatch → refine targeting
- Ad fatigue → refresh creative (check frequency)

### When CPM Is High
- Audience too narrow → expand targeting
- High competition → try different placements/times
- Low relevance score → improve creative fit

### Bid Strategy Progression
1. Start with manual or cost caps
2. Gather data (50+ conversions)
3. Switch to automated bidding with targets from historical data
4. Monitor and adjust

---

## Email Sequences

### Core Principles
- **One email, one job** — each email has a single purpose and CTA
- **Value before ask** — earn the right to sell
- **Relevance over volume** — segment, don't blast

### Common Sequences

| Type | Emails | Purpose |
|------|--------|---------|
| Welcome | 5-7 | Introduce product, deliver value, first conversion |
| Lead nurture | 6-8 | Move from awareness to consideration to decision |
| Onboarding | 5-7 | Guide new users to activation |
| Re-engagement | 3-4 | Win back inactive users |
| Post-purchase | 3-5 | Retention, upsell, referral |

### Email Structure
1. **Hook**: First line earns the second line
2. **Context**: Why this matters to them now
3. **Value**: The insight, resource, or offer
4. **CTA**: Single, clear action
5. **Sign-off**: Personal, not corporate

### Subject Line Rules
- 6-10 words, under 50 characters
- Specificity > cleverness
- Preview text is a second headline — don't waste it
- Test: Would this subject line make you open it?

### Timing
- Welcome email: Immediately after signup
- Sequence spacing: 2-3 days between emails
- Best send times: Tuesday-Thursday, 9-11am recipient's timezone
- Always respect unsubscribes and frequency preferences

---

## Launch Strategy

### Launch Tiers

| Tier | What | Channels | Effort |
|------|------|----------|--------|
| 1 (Major) | New product, rebrand, major feature | All channels, press, partnerships | 4-6 weeks prep |
| 2 (Medium) | Significant feature, integration | Blog, email, social, community | 2-3 weeks prep |
| 3 (Minor) | Small feature, improvement | Changelog, in-app, social | 1 week prep |

### ORB Framework (Owned, Rented, Borrowed)

| Channel type | Examples | Control | Cost |
|-------------|----------|---------|------|
| **Owned** | Blog, email list, product, social profiles | Full | Low |
| **Rented** | Paid ads, sponsored content, influencers | Medium | Variable |
| **Borrowed** | PR, community posts, guest content, word of mouth | Low | Low-medium |

### Pre-Launch Checklist
- [ ] Landing page live and tested
- [ ] Email sequence drafted and scheduled
- [ ] Social posts prepared
- [ ] Internal team briefed
- [ ] Analytics/tracking verified
- [ ] Customer support prepared with FAQ
- [ ] Press/media outreach sent (Tier 1)

---

## Attribution & Reporting

### Weekly Review Checklist
- Spend vs. budget pacing
- CPA/ROAS vs. targets
- Top and bottom performing ads
- Audience performance breakdown
- Frequency check (fatigue risk)
- Landing page conversion rate

### Attribution Reality
- Platform attribution is always inflated (self-reported conversions)
- Use UTM parameters consistently (see google-analytics skill for UTM standards)
- Compare platform data to GA4
- Look at blended CAC, not just platform CPA
- No attribution model is "correct" — they answer different questions

---

## Common Mistakes

| Mistake | Do this instead |
|---------|----------------|
| Launching without conversion tracking | Test a real conversion before spending |
| Too many campaigns fragmenting budget | Start with 2-3, consolidate winners |
| Not giving algorithms learning time | Wait 3-5 days before judging |
| Only one ad per ad set | Run 3-5 creative variations |
| Never refreshing creative | Rotate every 2-4 weeks or when frequency > 3 |
| Ad/landing page mismatch | Message match: ad promise = page headline |
| Spreading budget too thin | Better to dominate one channel than sprinkle across five |
| Optimizing for wrong metric | Align metric to actual business goal |
| UTMs on internal links | UTMs are for external inbound traffic only |

---

## Related Skills

- **product-marketing-context**: Foundation for audience, positioning, and campaign brief context
- **google-analytics**: For tracking campaign performance and conversion data
- **seo**: For organic search to complement paid
- **content-copywriting**: For ad copy and landing page content
- **reporting**: For campaign performance reports
