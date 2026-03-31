---
name: c1-request-access
description: Search for and request entitlements in ConductorOne using the conductorone MCP server. IMPORTANT — trigger this skill BEFORE attempting to call any external system tool. When the user wants to query Salesforce data, access a production database, pull reports from a SaaS tool, or perform any action involving an external system — invoke this skill FIRST to check access, do NOT try calling the system tool directly. Also trigger when the user asks "what can I request", "what access is available", "request access to X", or wants to browse requestable apps/entitlements.
metadata:
  version: 1.0.0
---

# ConductorOne: Search & Request Access

You help marketing team members get access to the external systems they need — Salesforce, Google Analytics, databases, SaaS tools — through ConductorOne, the company's access governance platform. Your job is to find the right entitlement, submit the request, and then complete the user's original task once access is granted.

## Before Starting

Read `.agents/product-marketing-context.md` if it exists — it may tell you which external systems the team uses and what data sources are relevant.

### Least Privilege Principle

Always request the **minimum access needed** to complete the task:

- **Read-only first** — if the user needs to view data, request read/list access, never write or admin access
- **Narrowest scope** — request access to the specific entitlement needed, not broad app-level access
- **Shortest duration** — use `grant_duration` for time-limited access when the task is a one-time query, not ongoing work
- **One entitlement at a time** — don't batch-request access to multiple systems "just in case"

When multiple entitlements could satisfy a request, prefer the one with the most restrictive scope. For example, choose "Execute list_accounts" over "Salesforce Admin Access".

### Caching Within a Conversation

Once you've retrieved the following, reuse them for the rest of the conversation — don't re-fetch:
- **User ID** from `list_introspect` (Step 2) — this doesn't change within a session
- **App IDs and entitlement IDs** from search results — these are stable identifiers

**Do re-check** tool availability (ToolSearch):
- After a new entitlement is granted — the tool list changes when access is provisioned
- When a tool call fails unexpectedly — a time-limited grant may have expired (e.g., a 1-hour grant from earlier in the conversation)
- If the conversation spans a long period — don't assume a tool that worked an hour ago still works

---

## Step 1 — Check if the Tool Already Exists

Before searching ConductorOne, check whether the MCP tool the user needs is already available. Use ToolSearch to look for it:
```
ToolSearch(query: "<tool name or keyword, e.g. 'salesforce', 'ga4', 'slack'>", max_results: 5)
```

- **If the tool is found**: the user already has access. Skip to calling the tool directly — no entitlement request needed.
- **If the tool is not found**: the user doesn't have access yet. Continue to Step 2.

This avoids unnecessary access requests for tools the user can already use.

---

## Step 2 — Identify the Current User

First, load the ConductorOne tools needed for the remaining steps (they are deferred and must be fetched before use):
```
ToolSearch(query: "select:mcp__conductorone__list_introspect,mcp__conductorone__request_catalog_search_entitlements,mcp__conductorone__app_search_search,mcp__conductorone__app_entitlement_search_service_search,mcp__conductorone__list_entitlement,mcp__conductorone__task_service_get", max_results: 10)
```

Then call `mcp__conductorone__list_introspect` to get the authenticated user's identity.

Extract:
- `userId` — needed for submitting access requests
- `roles` — shows what the user is already authorized for

---

## Step 3 — Find the Right Entitlement

Choose your search strategy based on what the user is asking for:

### If the user wants something specific (e.g., "get me Salesforce data")

Search requestable entitlements first — these are entitlements the user is allowed to ask for:
```
mcp__conductorone__request_catalog_search_entitlements(query: "Salesforce")
```

### If the search is too broad or returns too many results

Narrow by finding the app first:
```
mcp__conductorone__app_search_search(query: "Salesforce")
```

Then list entitlements for that specific app:
```
mcp__conductorone__list_entitlement(app_id: "<app_id>")
```

### If the user wants to browse ("what can I request?")

```
mcp__conductorone__request_catalog_search_entitlements(page_size: 25)
```

Present results as a table:

| App | Entitlement | Description | Duration |
|-----|-------------|-------------|----------|

**Key fields to extract from results:**
- `appId` — the parent app ID
- `id` — the entitlement ID (both needed for Step 4)
- `displayName` — show this to the user
- `description` — helps confirm it's the right entitlement
- `durationGrant` — some entitlements are time-limited (e.g., `3600s` = 1 hour)
- `grantCount` — how many people currently have this

**Choosing between multiple entitlements:**

When search returns multiple results, apply least privilege:
1. Prefer entitlements with "read", "list", "view", or "Execute list_" in the name over "write", "admin", "manage", or "full access"
2. Prefer entitlements scoped to a specific resource (e.g., "Execute list_accounts") over broad ones (e.g., "App Admin")
3. Prefer time-limited entitlements (`durationGrant` set) over permanent grants
4. If unsure, present the options to the user and recommend the most restrictive one that satisfies their need

Tell the user what you found and confirm it matches what they need before proceeding.

---

## Step 4 — Submit the Access Request

**Important**: The grant tool is deferred and must be loaded before use. This requires two tool calls — do not skip the first one.

First, load the tool:
```
ToolSearch(query: "select:mcp__conductorone__task_service_create_grant_task", max_results: 1)
```

Then submit the request:
```
mcp__conductorone__task_service_create_grant_task(
  app_id: "<appId from Step 3>",
  app_entitlement_id: "<entitlement id from Step 3>",
  identity_user_id: "<userId from Step 2>",
  description: "<clear justification — what the user needs and why>"
)
```

**Optional parameters:**
- `grant_duration` — request time-limited access (e.g., `"3600s"` for 1 hour). Prefer this for one-time queries.

Extract the `task_id` from the response. Tell the user the request has been submitted.

---

## Step 5 — Check Request Status

Poll the task to see if access has been granted:
```
mcp__conductorone__task_service_get(id: "<task_id from Step 4>")
```

| Status | What to tell the user | Next action |
|--------|----------------------|-------------|
| **Approved / Provisioned** | Access granted | Re-run ToolSearch to discover the newly available tool, then call it to complete the user's request |
| **Pending** | Request is awaiting approval | Offer to check back, or the user can check ConductorOne directly |
| **Denied** | Request was denied | Share the reason if available, suggest contacting the entitlement owner |
| **Error** | Something went wrong | Check the error details and suggest the user contact their admin |

---

## Search Tools Reference

| Tool | Use for | Scope |
|------|---------|-------|
| `request_catalog_search_entitlements` | Finding entitlements the user can request | Only requestable entitlements |
| `app_entitlement_search_service_search` | Broader entitlement search across all apps | All entitlements (may include non-requestable) |
| `app_search_search` | Finding apps by name | All apps |
| `list_entitlement` | Listing all entitlements for a specific app | Single app |
| `list_introspect` | Getting current user identity and roles | Current session |
| `task_service_create_grant_task` | Submitting an access request | Creates a task |
| `task_service_get` | Checking request status | Single task |

---

## Common Mistakes to Avoid

| Mistake | Why it's wrong | Do this instead |
|---------|---------------|-----------------|
| Calling an external system tool before checking access | Will fail if the user doesn't have a grant | Check for the tool with ToolSearch first (Step 1) |
| Skipping Step 1 and going straight to ConductorOne | The tool may already be available — unnecessary access request | Always check ToolSearch before searching entitlements |
| Skipping the ToolSearch call before `task_service_create_grant_task` | The grant tool is deferred and won't exist until loaded | Always call ToolSearch first |
| Guessing app or entitlement IDs | IDs are opaque KSUIDs — you can't infer them | Always search to find the correct IDs |
| Submitting a vague description | Approvers need to understand the request to approve it | Include what data is needed and why |
| Not extracting the task ID after submitting | Can't check status without it | Always capture the task ID from the response |
| Searching `app_entitlement_search_service_search` when the user wants requestable items | Returns all entitlements including ones the user can't request | Use `request_catalog_search_entitlements` for requestable items |
| Forgetting to complete the user's original task after access is granted | The user asked for data, not just access | Once approved, call the external tool and deliver the results |
| Requesting write/admin access when read-only suffices | Violates least privilege — broader access than needed increases risk | Always start with the most restrictive entitlement that satisfies the task |
| Requesting permanent access for a one-time query | Leaves unnecessary standing access open | Use `grant_duration` for time-limited access when the task is a one-off |

---

## Related Skills

- **google-analytics**: Often the destination — user needs GA4 data, this skill gets the access
- **reporting**: Reports may require data from multiple external systems
- **campaign-management**: Campaign analysis may need Salesforce or ad platform data
