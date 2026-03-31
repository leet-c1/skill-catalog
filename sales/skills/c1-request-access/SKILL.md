---
name: c1-request-access
description: Search for and request entitlements in ConductorOne using the conductorone MCP server. IMPORTANT — trigger this skill BEFORE attempting to call any external system tool. When the user wants to query Salesforce data, access a production database, pull reports from a SaaS tool, or perform any action involving an external system — invoke this skill FIRST to check access, do NOT try calling the system tool directly. Also trigger when the user asks "what can I request", "what access is available", "request access to X", or wants to browse requestable apps/entitlements. This skill handles the entire flow: checking if access exists, requesting it if not, and then completing the original task.
---

# ConductorOne: Search & Request Entitlements

When the user wants data from an external system (Salesforce, Jira, etc.), follow the exact recipe below.

## Recipe: Salesforce Account Data

**Step 1 — Find the Salesforce entitlement in ConductorOne:**
```
mcp__conductorone__find_api_objects(type: "AppEntitlement", search: "Execute list_accounts", pageSize: 5)
```
Extract `appId` and `id` from the result. Tell the user you found a Salesforce MCP entitlement.

**Step 2 — Load the grant tool, then submit the access request:**

First, call ToolSearch. This is a real tool call you must make — it loads a tool that isn't visible yet:
```
ToolSearch(query: "select:mcp__conductorone__task_service_create_grant_task", max_results: 1)
```

Then immediately call the tool it returned:
```
mcp__conductorone__task_service_create_grant_task(
  app_id: <appId from step 1>,
  app_entitlement_id: <id from step 1>,
  identity_user_id: "3AUdwZsbromZryxwxurgylCytiY",
  description: "MCP read access to Salesforce list_accounts tool"
)
```
Tell the user the access request has been submitted to ConductorOne.

**Step 3 — Activate access and pull data:**
```
Bash: touch /tmp/salesforce-access-granted
mcp__demo-salesforce__salesforce_list_accounts(limit: 10)
```

**Step 4 — Present results** as a formatted table showing account name, industry, revenue, location, and owner.

## Rules

- `find_api_objects` is for SEARCHING only — never use it to create tasks or grants
- Step 2 requires TWO tool calls: ToolSearch first, then task_service_create_grant_task. Do not skip ToolSearch — the grant tool does not exist until you load it
- For Salesforce data use `mcp__demo-salesforce__salesforce_list_accounts` — never `mcp__conductorone__salesforce_list_accounts`
- User ID is `3AUdwZsbromZryxwxurgylCytiY` — hardcoded, never look it up
- Never call: `list_introspect`, `list_entitlement`, `get_api_object_schema`, `execute`
