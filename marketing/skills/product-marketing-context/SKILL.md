---
name: product-marketing-context
description: Create or update the foundational product marketing context document. Use when the user mentions "product context", "marketing context", "set up context", "positioning", "target audience", "ICP", "ideal customer profile", "describe my product", or wants to avoid repeating foundational information across marketing tasks. Run this before using other marketing skills.
metadata:
  version: 1.0.0
---

# Product Marketing Context

You help create and maintain a product marketing context document at `.agents/product-marketing-context.md`. This is the foundation that all other marketing skills reference, so users don't repeat themselves.

## Workflow

### Step 1: Check for Existing Context

Check if `.agents/product-marketing-context.md` exists.

**If it exists:** Read it, summarize what's there, ask which sections to update. Only gather info for those sections.

**If it doesn't exist, offer two options:**

1. **Auto-draft from codebase** (recommended): Read README, landing pages, marketing copy, package.json, etc. Draft a V1. User reviews and fills gaps.
2. **Start from scratch**: Walk through sections conversationally, one at a time.

### Step 2: Gather Information

Walk through each section below. Don't dump all questions at once — go one section at a time, confirm, then move on.

**Push for verbatim customer language.** Exact phrases > polished descriptions. Ask "How do your customers describe this problem?" not "What problem do you solve?"

---

## Sections to Capture

### 1. Product Overview
- One-line description
- What it does (2-3 sentences)
- Product category (what "shelf" customers look for you on)
- Product type (SaaS, marketplace, e-commerce, service, etc.)
- Business model and pricing

### 2. Target Audience
- Target company type (industry, size, stage)
- Target decision-makers (roles, departments)
- Primary use case
- Jobs to be done (2-3 things customers "hire" you for)
- Specific scenarios

### 3. Personas
For each stakeholder in the buying process (User, Champion, Decision Maker, Financial Buyer, Technical Influencer):
- What they care about
- Their challenge
- The value you promise them

Skip for B2C or single-buyer products.

### 4. Problems & Pain Points
- Core challenge before finding you
- Why current solutions fall short
- What it costs them (time, money, opportunities)
- Emotional tension (stress, fear, doubt)

### 5. Competitive Landscape
- **Direct competitors**: Same solution, same problem
- **Secondary competitors**: Different solution, same problem
- **Indirect competitors**: Conflicting approach (manual process, assistant, etc.)
- How each falls short

### 6. Differentiation
- Key differentiators (capabilities alternatives lack)
- How you solve it differently
- Why that's better
- Why customers choose you over alternatives

### 7. Objections & Anti-Personas
- Top 3 objections and how to address them
- Who is NOT a good fit

### 8. Switching Dynamics (JTBD Four Forces)
- **Push**: Frustrations driving them from current solution
- **Pull**: What attracts them to you
- **Habit**: What keeps them stuck with current approach
- **Anxiety**: What worries them about switching

### 9. Customer Language
- How customers describe the problem (verbatim quotes)
- How they describe your solution (verbatim quotes)
- Words/phrases to use
- Words/phrases to avoid
- Product-specific glossary

### 10. Brand Voice
- Tone (professional, casual, playful, technical)
- Communication style (direct, conversational, academic)
- Brand personality (3-5 adjectives)

### 11. Proof Points
- Key metrics or results
- Notable customers/logos
- Testimonial snippets
- Value themes with evidence

### 12. Goals
- Primary business goal
- Key conversion action
- Current metrics (if known)

---

## Step 3: Create the Document

Save to `.agents/product-marketing-context.md` with all sections in clean markdown. Use tables for structured data (personas, competitors), quotes for customer language.

## Step 4: Confirm

- Show the completed document
- Ask if anything needs adjustment
- Tell them: "Other marketing skills will now use this context automatically. Update anytime by asking to revise the product marketing context."

## Tips

- Be specific: "What's the #1 frustration that brings them to you?" not "What problems exist?"
- Capture exact customer words over polished descriptions
- Ask for examples — they unlock better answers
- Skip sections that don't apply (e.g., Personas for simple B2C)
- Validate each section before moving on

---

## Related Skills

Once your context document is set up, these skills will use it automatically:

- **google-analytics**: Pull analytics data and build performance reports
- **seo**: Audit and improve search rankings
- **campaign-management**: Plan paid ads, email sequences, and launches
- **content-copywriting**: Write and improve marketing copy
- **reporting**: Build weekly, monthly, and quarterly reports
