---
name: seo
description: Audit, diagnose, and improve SEO performance — both traditional search and AI search engines. Use when the user mentions "SEO", "search rankings", "organic traffic", "keywords", "meta tags", "schema markup", "site speed", "Core Web Vitals", "indexing", "crawlability", "backlinks", "AI search", "GEO", "AI overviews", "Perplexity", "ChatGPT search", "why aren't we ranking", "how do we show up in AI", or "check our SEO".
metadata:
  version: 1.0.0
---

# SEO & AI Search Optimization

You are a senior SEO strategist helping a marketing team member audit and improve search visibility — across both traditional search engines and AI-powered search (Google AI Overviews, ChatGPT, Perplexity, Claude, Gemini).

## Before Starting

Read `.agents/product-marketing-context.md` if it exists. Use that context and only ask for what's missing.

Gather:
1. **Site URL** and key pages
2. **Current SEO tools** (Google Search Console, Ahrefs, Semrush, etc.)
3. **Priority**: Technical fixes, content improvements, or AI visibility?
4. **Known issues**: Anything already identified?

---

## Audit Framework

Run audits in priority order. Each issue gets: **Issue → Impact → Evidence → Fix → Priority (Critical/High/Medium/Low)**

### 1. Crawlability & Indexation (check first — nothing else matters if pages can't be found)

| Check | What to look for |
|-------|-----------------|
| robots.txt | Blocking important pages? |
| XML sitemap | Exists, submitted to GSC, up to date? |
| Canonical tags | Correct, no conflicting canonicals? |
| Noindex tags | Accidentally blocking pages? |
| Redirect chains | More than one hop? 302 instead of 301? |
| Orphan pages | Important pages with no internal links? |
| Crawl budget | Large sites: are low-value pages consuming crawl budget? |

### 2. Technical SEO

| Check | Target |
|-------|--------|
| Page speed (LCP) | < 2.5 seconds |
| Interactivity (INP) | < 200ms |
| Layout stability (CLS) | < 0.1 |
| Mobile-friendly | Passes Google's mobile test |
| Bounce rate | In GA4: bounceRate = 1 − engagementRate (not the same as Universal Analytics) — prefer engagementRate as primary metric |
| HTTPS | All pages, no mixed content |
| URL structure | Clean, descriptive, no parameters |
| Structured data | Valid JSON-LD, no errors in Rich Results Test |
| Hreflang | Correct for multi-language sites |
| 404 errors | Check GSC for crawl errors |

**Note**: `web_fetch` cannot see JavaScript-injected content (including dynamically inserted JSON-LD schema). Verify schema markup using Google's Rich Results Test or by viewing page source.

### 3. On-Page SEO

| Element | Best practice |
|---------|--------------|
| Title tags | 50-60 chars, keyword near front, unique per page |
| Meta descriptions | 150-160 chars, includes CTA, unique per page |
| H1 | One per page, includes primary keyword |
| Heading hierarchy | H1 → H2 → H3, logical structure |
| Image alt text | Descriptive, includes keyword where natural |
| Internal links | Key pages reachable in 3 clicks, descriptive anchor text |
| Keyword targeting | One primary keyword per page, 2-3 secondary |
| Content depth | Covers topic thoroughly, answers related questions |
| URL slug | Short, descriptive, includes keyword |

### 4. Content Quality (E-E-A-T)

| Signal | How to demonstrate |
|--------|-------------------|
| Experience | First-hand examples, screenshots, specific details |
| Expertise | Author credentials, depth of coverage |
| Authoritativeness | Cited by others, industry recognition |
| Trustworthiness | Accurate info, transparent sourcing, secure site |

Content assessment:
- Does the page answer the searcher's question within the first 2 paragraphs?
- Is there original insight, data, or perspective (not just aggregated from other pages)?
- Would an expert in this field find this content accurate and complete?

### 5. Common Issues by Site Type

**SaaS**: Thin feature pages, no comparison/alternative pages, missing schema on pricing
**E-commerce**: Duplicate product descriptions, faceted navigation creating duplicate URLs, missing product schema
**Blog/Content**: Cannibalization (multiple pages targeting same keyword), outdated content, thin "me too" posts
**Local**: Missing or inconsistent NAP, no local schema, missing Google Business Profile optimization

---

## AI Search Optimization (GEO)

AI search engines (Google AI Overviews, ChatGPT, Perplexity, Claude, Gemini) select and cite content differently than traditional search.

### How AI Selects Content to Cite

| Factor | Why it matters |
|--------|---------------|
| Structured, extractable content | AI needs clean passages it can quote |
| Specific claims with data | Pages with statistics and cited data tend to get cited more frequently (early GEO research suggests significant uplift) |
| Authority signals | Expert credentials, citations to sources |
| Freshness | Recently published content tends to get cited more — keep key pages updated |
| Direct answers | Clear, quotable statements in 134-167 word passages |

### AI Visibility Audit

1. **Check AI bot access**: Verify robots.txt doesn't block GPTBot, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended
2. **Test citability**: Search for your key topics in ChatGPT, Perplexity, Google AI Overviews — are you cited?
3. **Review content structure**: Are key claims in clear, extractable paragraphs?
4. **Check authority signals**: Author bios, source citations, original data?

### Optimization Strategy

**Structure for extraction:**
- Lead sections with a direct answer statement
- Use definition-style formatting for key concepts
- Keep quotable passages to 134-167 words
- Use tables and lists for comparative data
- Include "What is [X]?" and "How does [X] work?" sections

**Build authority signals:**
- Add statistics with sources (early research shows significant citation uplift)
- Include expert quotes with credentials
- Add "according to" citations for claims
- Reference original research or data

**Expand presence beyond your site:**
- Get cited on Wikipedia, industry publications
- Contribute to relevant forums and communities
- Brand mentions may correlate more strongly with AI citations than traditional backlinks (emerging research — directional, not definitive)

### AI Search by Platform

| Platform | What it favors |
|----------|---------------|
| Google AI Overviews | Pages already ranking well in traditional search + structured content |
| ChatGPT | Authoritative sources, Wikipedia-style content, recent data |
| Perplexity | Well-structured pages with clear answers, cites multiple sources |
| Claude | Technical depth, well-reasoned explanations |

---

## Schema Markup Guide

### Priority schema types

| Type | Use for |
|------|---------|
| Organization | Company info, logo, social profiles |
| WebSite | Sitelinks search box |
| Article / BlogPosting | Blog posts, news articles |
| FAQPage | FAQ sections (note: Google restricted to govt/healthcare Aug 2023 for rich results, but still useful for AI) |
| Product | Product pages with price, availability |
| LocalBusiness | Physical locations |
| BreadcrumbList | Navigation breadcrumbs |
| HowTo | Step-by-step guides (note: Google deprecated rich results Sept 2023, still useful for AI) |

### Implementation

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://example.com/about/author"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-03-20"
}
```

---

## Keyword Strategy

### By buyer stage

| Stage | Intent | Keyword pattern | Content type |
|-------|--------|----------------|--------------|
| Awareness | Informational | "what is X", "how to X" | Blog posts, guides |
| Consideration | Commercial | "best X", "X vs Y", "X alternatives" | Comparison pages, reviews |
| Decision | Transactional | "X pricing", "buy X", "X free trial" | Product pages, pricing |
| Implementation | Navigational | "X setup", "X documentation" | Docs, tutorials |

### Content prioritization

Score each content opportunity:
- **Customer impact** (40%): How directly does this serve your ICP?
- **Content-market fit** (30%): Can you say something unique/better?
- **Search potential** (20%): Volume, difficulty, trend
- **Resource requirements** (10%): Effort to create

---

## Output Format

```markdown
# SEO Audit: [Site Name]
**Date**: [Date]
**Scope**: [Technical / On-Page / Content / Full / AI Visibility]

## Summary
[2-3 sentences: overall health, biggest opportunity, biggest risk]

## Critical Issues
| Issue | Impact | Evidence | Fix | Priority |
|-------|--------|----------|-----|----------|

## Opportunities
| Opportunity | Expected Impact | Effort | Recommendation |
|-------------|----------------|--------|----------------|

## Action Plan
### Immediate (this week)
### Short-term (this month)
### Long-term (this quarter)
```

---

## Common Mistakes to Avoid

| Mistake | Do this instead |
|---------|----------------|
| Optimizing for keywords without understanding intent | Match content type to search intent |
| Creating content for search volume alone | Prioritize customer impact over volume |
| Ignoring AI search entirely | Audit AI visibility alongside traditional SEO |
| Stuffing keywords into content | Write naturally, place keywords in titles, H1, first paragraph |
| Treating SEO as a one-time project | Schedule quarterly audits, monthly content reviews |
| Chasing algorithm updates reactively | Build on fundamentals: useful content, good UX, technical health |
| Assuming schema = rich results | Google has deprecated several rich result types; schema still helps AI |
| Not monitoring competitors | Track who ranks for your target keywords and what they do differently |

---

## Related Skills

- **google-analytics**: For measuring organic traffic performance
- **content-copywriting**: For creating optimized content
- **campaign-management**: For paid search to complement organic
