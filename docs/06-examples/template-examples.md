# Template Examples

This guide provides examples of high-quality templates for different document types, demonstrating best practices for frontmatter schemas and content structure.

## ADR Template

### Basic ADR Template

```markdown
---
id: {{id}}
title: "{{title}}"
status: {{status}}
date: {{date}}
authors: []
tags: []
---

# {{title}}

## Status

{{status}} - {{date}}

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing or have agreed to implement?

## Consequences

What becomes easier or more difficult to do and any risks introduced by this change?

## Alternatives Considered

What other options did we look at?

## References

- Links to relevant discussions, issues, or documents
```

### Enhanced ADR Template

```markdown
---
id: {{id}}
title: "{{title}}"
status: {{status}}
date: {{date}}
authors: []
reviewers: []
tags: []
components: []
impact: "medium"  # low, medium, high
effort: "medium"  # low, medium, high
deadline: null
related_adrs: []
supersedes: null
superseded_by: null
---

# ADR-{{id}}: {{title}}

## Status

**{{status}}** - {{date}}

{{#if superseded_by}}
> ⚠️ **Superseded**: This ADR has been superseded by [ADR-{{superseded_by}}](../{{superseded_by}}-*.md)
{{/if}}

{{#if supersedes}}
> 📎 **Supersedes**: [ADR-{{supersedes}}](../{{supersedes}}-*.md)
{{/if}}

## Context and Problem Statement

<!-- What is the issue that we're seeing that is motivating this decision or change? -->

## Decision Drivers

<!-- List the key factors that influence this decision -->

* Factor 1
* Factor 2
* Factor 3

## Considered Options

<!-- List the options considered -->

* Option 1: [description]
* Option 2: [description]
* Option 3: [description]

## Decision Outcome

Chosen option: **Option X**, because [justification].

### Positive Consequences

* [e.g., improvement of quality attribute satisfaction, follow-up decisions required, ...]

### Negative Consequences

* [e.g., compromising quality attribute, follow-up decisions required, ...]

## Pros and Cons of the Options

### Option 1

[example | description | pointer to more information | ...]

* ✅ Good, because [argument a]
* ✅ Good, because [argument b]
* ❌ Bad, because [argument c]
* 🤷 Neutral, because [argument d]

### Option 2

[example | description | pointer to more information | ...]

* ✅ Good, because [argument a]
* ❌ Bad, because [argument b]
* 🤷 Neutral, because [argument c]

## Implementation

### Action Items

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Timeline

| Phase | Duration | Owner |
|-------|----------|--------|
| Design | 1 week | Team A |
| Implementation | 2 weeks | Team B |
| Testing | 1 week | QA Team |

## Validation

### Success Criteria

How will we know this decision is working?

* Metric 1: [description]
* Metric 2: [description]

### Review Date

This decision should be reviewed by {{date_add date days=90}}.

## References

* [Link 1](https://example.com) - Description
* [RFC XXX](https://example.com) - Related standard
* [Issue #123](https://github.com/org/repo/issues/123) - Related discussion
```

## Ticket Template

### Agile Story Template

```markdown
---
id: "{{id}}"
title: "{{title}}"
status: "To Do"
type: "story"  # story, bug, task, epic
priority: "Medium"  # Low, Medium, High, Critical
estimate: null
owner: null
sprint: null
epic: null
labels: []
acceptance_criteria: []
definition_of_done: []
created_date: {{date}}
updated_date: {{date}}
---

# {{id}}: {{title}}

## Description

**As a** [persona]  
**I want** [functionality]  
**So that** [benefit]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Definition of Done

- [ ] Code written and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Product owner approval

## Technical Details

### Implementation Notes

<!-- Technical approach, architecture considerations -->

### Dependencies

* Depends on: [Ticket/Feature]
* Blocks: [Ticket/Feature]

### Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|---------|------------|------------|
| Risk 1 | High | Low | Mitigation strategy |

## Testing Strategy

### Test Cases

1. **Happy Path**: [description]
2. **Edge Cases**: [description]
3. **Error Handling**: [description]

### Manual Testing

- [ ] Test case 1
- [ ] Test case 2

### Automated Testing

- [ ] Unit tests for [component]
- [ ] Integration tests for [workflow]

## Notes

<!-- Additional context, links, discussions -->
```

### Bug Report Template

```markdown
---
id: "{{id}}"
title: "{{title}}"
status: "Open"
type: "bug"
severity: "Medium"  # Low, Medium, High, Critical
priority: "Medium"  # Low, Medium, High, Critical
owner: null
sprint: null
labels: ["bug"]
found_in_version: null
fixed_in_version: null
browser: null
environment: null
created_date: {{date}}
updated_date: {{date}}
---

# 🐛 {{id}}: {{title}}

## Summary

Brief description of the bug.

## Environment

* **Version**: [version number]
* **Browser**: [browser and version]
* **OS**: [operating system]
* **Device**: [if mobile]

## Steps to Reproduce

1. Step 1
2. Step 2
3. Step 3

## Expected Behavior

What should happen.

## Actual Behavior

What actually happens.

## Screenshots/Videos

[Attach screenshots or videos if applicable]

## Error Messages

```
Error message here
```

## Workaround

[If a workaround exists]

## Impact

* **Users affected**: [number or percentage]
* **Business impact**: [description]
* **Frequency**: [how often it occurs]

## Root Cause Analysis

### Investigation

[Technical investigation details]

### Root Cause

[The underlying cause]

### Fix

[How the issue was resolved]

## Prevention

How can we prevent similar issues in the future?

- [ ] Add test coverage
- [ ] Update documentation
- [ ] Improve monitoring
```

## Epic Template

```markdown
---
id: "{{id}}"
title: "{{title}}"
status: "planned"  # planned, active, completed, cancelled
owner: null
start_date: null
target_date: null
actual_completion_date: null
budget: null
business_value: null
success_metrics: []
stakeholders: []
tags: []
related_epics: []
---

# Epic: {{title}}

## Vision

One-sentence description of what we're building and why.

## Business Value

### Problem Statement

What problem are we solving for users/business?

### Success Metrics

How will we measure success?

* Metric 1: [description and target]
* Metric 2: [description and target]

### Business Impact

* Revenue impact: [estimate]
* Cost savings: [estimate]
* User satisfaction: [expected improvement]

## Scope

### In Scope

* Feature 1
* Feature 2
* Feature 3

### Out of Scope

* Feature X (future consideration)
* Feature Y (different epic)

## User Stories

### Core Stories

- [ ] [TICKET-001](../06-sprint-tickets/TICKET-001.md) - Core functionality
- [ ] [TICKET-002](../06-sprint-tickets/TICKET-002.md) - User interface
- [ ] [TICKET-003](../06-sprint-tickets/TICKET-003.md) - Integration

### Nice-to-Have Stories

- [ ] [TICKET-004](../06-sprint-tickets/TICKET-004.md) - Enhancement 1
- [ ] [TICKET-005](../06-sprint-tickets/TICKET-005.md) - Enhancement 2

## Timeline

### Milestones

| Milestone | Target Date | Status | Dependencies |
|-----------|-------------|---------|--------------|
| Phase 1: Foundation | 2024-08-15 | 🔵 Planned | Infrastructure ready |
| Phase 2: Core Features | 2024-09-30 | 🔵 Planned | Phase 1 complete |
| Phase 3: Polish | 2024-10-15 | 🔵 Planned | User testing |

### Resource Requirements

* Development: X developers for Y sprints
* Design: X designers for Y weeks
* QA: X testers for Y weeks

## Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|---------|------------|-------------------|
| Technical complexity | High | Medium | Proof of concept, expert consultation |
| Resource availability | Medium | Low | Cross-training, contractor backup |

## Dependencies

### Upstream Dependencies

What needs to be completed before this epic can start?

* Dependency 1: [description]
* Dependency 2: [description]

### Downstream Impact

What depends on this epic?

* Impact 1: [description]
* Impact 2: [description]

## Stakeholders

| Role | Name | Involvement |
|------|------|-------------|
| Product Owner | [Name] | Decision maker |
| Tech Lead | [Name] | Technical oversight |
| Designer | [Name] | UX/UI design |

## Notes

<!-- Additional context, decisions, links -->
```

## Sprint Template

```markdown
---
id: "{{id}}"
title: "{{title}}"
status: "planning"  # planning, active, completed
sprint_number: null
start_date: null
end_date: null
team: null
capacity: null
velocity_target: null
actual_velocity: null
goals: []
participants: []
---

# Sprint {{id}}: {{title}}

## Sprint Goals

### Primary Goal

[Main objective for this sprint]

### Secondary Goals

* Goal 2
* Goal 3

## Team Capacity

* **Team size**: X developers
* **Sprint length**: X weeks
* **Total capacity**: X story points
* **Available capacity**: X story points (accounting for PTO, holidays)

## Sprint Backlog

### Committed Stories

| Ticket | Title | Owner | Estimate | Status |
|--------|-------|-------|----------|---------|
| [TICKET-001](../06-sprint-tickets/TICKET-001.md) | Feature A | Dev 1 | 5 | ⏳ In Progress |
| [TICKET-002](../06-sprint-tickets/TICKET-002.md) | Feature B | Dev 2 | 3 | ✅ Done |

**Total Committed**: X story points

### Stretch Goals

| Ticket | Title | Owner | Estimate |
|--------|-------|-------|----------|
| [TICKET-003](../06-sprint-tickets/TICKET-003.md) | Enhancement C | Dev 3 | 2 |

## Sprint Events

### Sprint Planning

* **Date**: [date]
* **Duration**: [duration]
* **Participants**: [list]

### Daily Standups

* **Time**: [daily time]
* **Format**: [in-person/remote]

### Sprint Review

* **Date**: [date]
* **Demo items**: [list of features to demo]

### Sprint Retrospective

* **Date**: [date]
* **Format**: [retrospective format]

## Definition of Done

- [ ] Code written and reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Product owner acceptance

## Risks

| Risk | Impact | Mitigation |
|------|---------|------------|
| Risk 1 | Medium | Strategy 1 |

## Daily Progress

### Day 1 ({{date}})

* ✅ Completed: [items]
* 🔄 In Progress: [items]
* 🚫 Blocked: [items and reasons]

### Day 2 ({{date_add date days=1}})

* ✅ Completed: [items]
* 🔄 In Progress: [items]
* 🚫 Blocked: [items and reasons]

[Continue for each day...]

## Sprint Summary

### Achievements

* [What was accomplished]
* [Key deliverables]

### Velocity

* **Committed**: X points
* **Completed**: Y points
* **Velocity**: Y points

### Lessons Learned

* What went well
* What could be improved
* Action items for next sprint
```

## Configuration Examples

### Complete Configuration

```typescript
// folio.config.ts
import { defineConfig } from 'folio-cli';

export default defineConfig({
  root: 'docs',
  indexing: {
    columns: ['id', 'title', 'status', 'owner'],
    format: 'table',
  },
  types: {
    adr: {
      path: '02-architecture-and-design/adrs',
      template: 'adr.md',
      frontmatter: {
        id: { type: 'number', required: true, unique: true },
        title: { type: 'string', required: true },
        status: { 
          type: 'string', 
          enum: ['proposed', 'accepted', 'rejected', 'deprecated'],
          default: 'proposed'
        },
        date: { type: 'date', default: () => new Date() },
        authors: { type: 'string', isArray: true },
        reviewers: { type: 'string', isArray: true },
        tags: { type: 'string', isArray: true },
        components: { type: 'string', isArray: true },
        impact: { 
          type: 'string', 
          enum: ['low', 'medium', 'high'],
          default: 'medium'
        },
        effort: { 
          type: 'string', 
          enum: ['low', 'medium', 'high'],
          default: 'medium'
        }
      }
    },
    ticket: {
      path: '06-sprint-tickets',
      template: 'ticket.md',
      frontmatter: {
        id: { 
          type: 'string', 
          required: true, 
          unique: true, 
          pattern: /^[A-Z]+-\d+$/ 
        },
        title: { type: 'string', required: true },
        status: { 
          type: 'string', 
          enum: ['To Do', 'In Progress', 'Review', 'Done', 'Blocked'],
          default: 'To Do'
        },
        type: {
          type: 'string',
          enum: ['story', 'bug', 'task'],
          default: 'story'
        },
        priority: { 
          type: 'string', 
          enum: ['Low', 'Medium', 'High', 'Critical'],
          default: 'Medium'
        },
        estimate: { type: 'number' },
        owner: { type: 'string' },
        sprint: { type: 'string' },
        epic: { type: 'string' },
        labels: { type: 'string', isArray: true }
      }
    },
    epic: {
      path: '01-product-and-planning/epics',
      template: 'epic.md',
      frontmatter: {
        id: { type: 'string', required: true, unique: true },
        title: { type: 'string', required: true },
        status: { 
          type: 'string', 
          enum: ['planned', 'active', 'completed', 'cancelled'],
          default: 'planned'
        },
        owner: { type: 'string', required: true },
        start_date: { type: 'date' },
        target_date: { type: 'date' },
        business_value: { type: 'string' },
        success_metrics: { type: 'string', isArray: true },
        stakeholders: { type: 'string', isArray: true }
      }
    },
    sprint: {
      path: '06-sprint-tickets/sprints',
      template: 'sprint.md',
      frontmatter: {
        id: { type: 'string', required: true, unique: true },
        title: { type: 'string', required: true },
        status: { 
          type: 'string', 
          enum: ['planning', 'active', 'completed'],
          default: 'planning'
        },
        sprint_number: { type: 'number' },
        start_date: { type: 'date' },
        end_date: { type: 'date' },
        team: { type: 'string' },
        capacity: { type: 'number' },
        velocity_target: { type: 'number' }
      }
    }
  }
});
```

## See Also

- [The Folio Config](../02-core-concepts/01-the-folio-config.md) - Configuration reference
- [folio new](../03-command-reference/new.md) - Creating documents from templates
- [Quick Start](../01-getting-started/02-quick-start.md) - Getting started guide