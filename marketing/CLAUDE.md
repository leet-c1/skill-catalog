# Marketing Workspace

This workspace is configured for marketing team members using Claude Code with Google Analytics and other marketing tools.

## Getting Started

**First time?** Start by creating your product marketing context:
> "Help me set up our product marketing context"

This creates a foundational document about your product, audience, and voice that all other skills reference. You do this once; update it anytime things change. It takes about 20 minutes.

## Available Skills

| Skill | When to use |
|-------|-------------|
| **google-analytics** | Pull analytics data, build reports, audit tracking, understand traffic and conversions |
| **seo** | Audit search rankings, optimize pages, improve visibility in Google and AI search |
| **campaign-management** | Plan and optimize paid ads, email sequences, product launches |
| **content-copywriting** | Write or improve marketing copy, blog posts, landing pages, emails |
| **reporting** | Build weekly, monthly, or quarterly performance reports |
| **product-marketing-context** | Set up or update your product and audience context |
| **c1-request-access** | Check and request access to external systems (Salesforce, GA4, etc.) via ConductorOne |

## Shared Context

All skills check for `.agents/product-marketing-context.md` on startup. This document (product, audience, voice, positioning) is created once via the `product-marketing-context` skill and consumed by all others.

## Data Access

Accessing external data (GA4, Salesforce, etc.) requires the ConductorOne MCP server. Before querying any external system, invoke the `c1-request-access` skill to check whether access is granted and request it if not. Never call external system tools directly without checking access first.

## Important Rules

### All calculations use code
Claude always writes and runs Python code for any math — percentages, growth rates, averages, totals. This prevents the calculation errors that AI makes when doing arithmetic in its head. You'll see code blocks in responses; that's normal and means the numbers are accurate.

### UTM hygiene
UTM parameters are the tracking tags in campaign URLs (like `?utm_source=email`):
- Always lowercase: `email` not `Email`
- Use underscores for spaces: `spring_sale` not `spring sale`
- Never put UTMs on links between your own pages — it breaks session tracking

### Privacy
- Never include personal information (names, emails, phone numbers) in analytics events
- Cookie consent is required for visitors in the EU/UK (GDPR), Canada (CASL), and California (CCPA)
- GA4 data retention should be set to 14 months (default is only 2)

## Example Prompts

- "How is the site doing?" — performance overview with trends
- "Where is our traffic coming from?" — source/channel breakdown
- "Check our SEO" — full audit with prioritized fixes
- "Write a landing page for [product]" — draft with headline, copy, CTAs
- "Build this month's report" — structured report vs. last month
- "Plan a campaign for [launch]" — ads, emails, and timeline
- "Which pages have the highest bounce rate?" — page-level analysis
- "How did the [campaign name] campaign perform?" — campaign deep-dive
