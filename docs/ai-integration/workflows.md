# AI Integration Workflows

Real-world examples of how AI agents can work with Folio to enhance development workflows through intelligent documentation research and contribution.

## Overview

With Folio's AI integration, development becomes a collaborative process between humans and AI agents. The AI acts as a knowledgeable team member that researches existing decisions, identifies gaps, and contributes to project knowledge.

## Core Workflow Pattern

Every AI-assisted task follows this pattern:

1. **Research** → AI queries existing documentation
2. **Analyze** → AI identifies patterns, gaps, and constraints  
3. **Propose** → AI suggests solutions based on project knowledge
4. **Seek Approval** → AI presents decisions for human review
5. **Implement** → AI writes code following documented patterns

## Workflow Examples

### 1. Feature Implementation with Architecture Research

**Scenario:** Implementing user profile management

**Human Request:**
> "Add user profile editing functionality to our application"

**AI Workflow:**

```bash
# 1. Research existing patterns
search_documents(type="adr", tags="user-management", status="Accepted")
search_documents(type="ticket", q="user profile OR user data")

# 2. Check API patterns
search_documents(type="adr", tags="api-design", status="Accepted") 

# 3. Review security decisions
search_documents(type="adr", tags="security", status="Accepted")
```

**AI Response:**
> "I found ADR-003 requiring JWT authentication for all user data endpoints, and ADR-007 mandating input validation using Joi schemas. However, I don't see specific decisions about user profile data structure or update policies.
>
> I'll create ADR-012 to document the user profile management approach, then implement following your established patterns."

**AI Creates Documentation:**
```bash
create_document(
  type="adr",
  title="User Profile Management API Design",
  content="## Context\nWe need user profile editing...\n## Decision\nImplement RESTful profile endpoints following ADR-003 authentication and ADR-007 validation patterns...",
  frontmatter={
    "status": "Proposed",
    "tags": ["user-management", "api-design"],
    "supersedes": null,
    "related": ["ADR-003", "ADR-007"]
  }
)
```

**Outcome:** AI creates documented, pattern-consistent implementation

### 2. Bug Investigation with Historical Context

**Scenario:** Investigating authentication token expiration issues

**Human Request:**
> "Users are getting logged out unexpectedly. Investigate the token expiration behavior."

**AI Workflow:**

```bash
# 1. Find authentication decisions
search_documents(type="adr", tags="authentication", status="Accepted")

# 2. Look for previous similar issues
search_documents(type="ticket", q="token expiration OR logout OR session", status="Done")

# 3. Check for postmortems
search_documents(type="postmortem", q="authentication OR session")
```

**AI Analysis:**
> "Based on ADR-001, JWT tokens should expire after 24 hours with refresh token rotation. However, I found TICKET-245 from last month that reported similar issues, resolved by fixing the refresh token endpoint timing.
>
> I also found POSTMORTEM-003 documenting a production incident where clock skew caused premature token expiration.
>
> Let me check the current implementation against these documented solutions..."

**Outcome:** AI provides context-rich investigation with historical patterns

### 3. Architectural Decision Making

**Scenario:** Choosing a database for a new microservice

**Human Request:**
> "We need to add a notification service. What database should we use?"

**AI Workflow:**

```bash
# 1. Research existing data store decisions
search_documents(type="adr", tags="database", status="Accepted")

# 2. Check microservice patterns
search_documents(type="adr", tags="microservices", status="Accepted")

# 3. Look for notification-related decisions
search_documents(q="notification OR messaging")
```

**AI Response:**
> "Your project has established these database patterns:
> - ADR-004: PostgreSQL for transactional data
> - ADR-009: Redis for caching and sessions  
> - ADR-011: Each microservice owns its data store
>
> For notifications, I recommend PostgreSQL based on your consistency requirements, but I need to document this decision. I'll draft ADR-013."

**AI Creates ADR:**
```bash
create_document(
  type="adr", 
  title="Notification Service Database Selection",
  content="## Context\nNew notification service needs data persistence...\n## Decision\nUse PostgreSQL following ADR-004 and ADR-011 patterns...",
  frontmatter={
    "status": "Proposed",
    "tags": ["database", "microservices", "notifications"],
    "related": ["ADR-004", "ADR-009", "ADR-011"]
  }
)
```

**Outcome:** AI proposes consistent architectural decisions with documentation

### 4. Code Review with Policy Enforcement

**Scenario:** AI reviews a pull request for compliance

**Human Request:**
> "Review this authentication middleware PR for compliance with our security policies"

**AI Workflow:**

```bash
# 1. Get security requirements
search_documents(type="adr", tags="security", status="Accepted")

# 2. Check authentication standards  
search_documents(type="adr", tags="authentication", status="Accepted")

# 3. Look for middleware patterns
search_documents(q="middleware OR authentication middleware")
```

**AI Review:**
> "Reviewing against documented policies:
>
> ✅ **ADR-001 Compliance**: Uses JWT validation as required
> ✅ **ADR-006 Compliance**: Implements rate limiting per security policy  
> ❌ **ADR-008 Violation**: Missing required audit logging for authentication events
> ❌ **ADR-012 Violation**: Not using standardized error response format
>
> Please add audit logging per ADR-008 and use the error format from ADR-012."

**Outcome:** AI provides policy-aware code review with specific references

### 5. Sprint Planning with Historical Data

**Scenario:** Estimating work for upcoming sprint

**Human Request:**
> "Help estimate the effort for implementing real-time notifications"

**AI Workflow:**

```bash
# 1. Find similar past work
search_documents(type="ticket", tags="real-time OR websocket OR notifications", status="Done")

# 2. Check architectural constraints
search_documents(type="adr", tags="performance OR scalability", status="Accepted") 

# 3. Look for complexity indicators
search_documents(q="real-time OR websocket OR socket.io")
```

**AI Analysis:**
> "Based on historical data:
>
> **Similar Completed Work:**
> - TICKET-156: Real-time chat (8 story points, 2 sprints)
> - TICKET-203: Live dashboard updates (5 story points, 1 sprint)
> - TICKET-234: Push notifications (3 story points, 1 sprint)
>
> **Architectural Constraints (ADR-015):**
> - Must use Socket.io for consistency
> - Requires Redis for message broadcasting
> - Need load balancer sticky sessions
>
> **Estimate:** 6-8 story points based on similar real-time features, accounting for notification-specific complexity."

**Outcome:** AI provides data-driven estimates with architectural context

## Advanced Workflows

### Cross-Project Knowledge Sharing

For organizations with multiple Folio projects:

```bash
# AI can compare decisions across projects
search_documents(q="authentication") 
# + External project API calls
# = Cross-project pattern analysis
```

### Documentation Maintenance

AI can proactively maintain documentation:

```bash
# Find outdated ADRs
search_documents(type="adr", status="Accepted")
# + Code analysis
# = Identify documentation drift
```

### Compliance Monitoring

AI can monitor ongoing compliance:

```bash
# Regular policy checks
search_documents(type="adr", tags="security,compliance", status="Accepted")
# + Code review automation  
# = Continuous compliance validation
```

## Workflow Best Practices

### For Developers

**Start with Research:**
- Always ask AI to research before implementing
- Let AI find relevant ADRs and patterns
- Use AI to understand project constraints

**Document Decisions:**
- Have AI draft ADRs for new architectural choices
- Let AI update tickets with implementation notes
- Use AI to maintain decision traceability

**Learn from History:**
- Ask AI to find similar past work
- Use AI to understand why decisions were made
- Let AI identify successful patterns to repeat

### For AI Agents

**Research Thoroughly:**
- Search multiple document types (ADRs, tickets, epics)
- Use both metadata filters and content search
- Cross-reference related decisions

**Seek Human Approval:**
- Always propose new ADRs before implementing
- Present findings and ask for direction
- Explain reasoning based on documented patterns

**Maintain Consistency:**
- Follow established project patterns
- Reference related decisions in new documentation
- Use consistent naming and formatting

### For Teams

**Establish AI Guidelines:**
- Define when AI can create vs propose documentation
- Set standards for AI-generated content quality
- Create templates for AI to follow

**Monitor AI Contributions:**
- Review AI-created ADRs before acceptance
- Validate AI's interpretation of existing decisions
- Ensure AI maintains project voice and style

**Evolve with Feedback:**
- Regenerate prompts as project evolves
- Train AI on successful vs problematic patterns
- Refine AI guidelines based on outcomes

## Integration Patterns

### CI/CD Integration

```yaml
# .github/workflows/ai-review.yml
- name: AI Policy Review
  run: |
    folio serve --api &
    ai-reviewer --prompt=prompts/security-review.txt \
                 --files="${{ github.event.pull_request.changed_files }}"
```

### IDE Integration

```typescript
// VS Code extension using Folio API
const relevantDocs = await fetch('/api/documents?q=' + selectedCode);
showInlineDocumentation(relevantDocs);
```

### Chat Integration

```javascript
// Slack bot with Folio knowledge
bot.message(/^folio search (.+)/, async (message, match) => {
  const results = await folioAPI.search(match[1]);
  message.reply(formatResults(results));
});
```

## Measuring Success

### Key Metrics

**Developer Productivity:**
- Time from request to documented decision
- Reduced context switching for research
- Faster onboarding of new team members

**Documentation Quality:**
- Coverage of architectural decisions
- Consistency across team members
- Traceability of decision reasoning

**Knowledge Retention:**
- Reduced repeated discussions
- Better institutional memory
- Improved decision consistency

### Success Indicators

- AI finds relevant context 90%+ of the time
- New features follow documented patterns
- Team decisions reference existing ADRs
- Documentation stays current with implementation

---

**Next:** [Troubleshooting](./troubleshooting.md) - Solve common AI integration issues