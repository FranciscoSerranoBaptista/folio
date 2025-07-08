---
id: {{id}} # e.g., BE-001, FE-102
title: "{{title}}"
sprint: "" # e.g., sprint-06-reporting
epic: "" # e.g., EPIC-001
status: "To Do" # Options: To Do, In Progress, Review, Blocked, Done
owner: "" # The engineer assigned to this ticket
estimate: 0 # Story points, hours, or t-shirt size (e.g., 3, "M")
depends_on: [] # List of other ticket IDs, e.g., [BE-001]
source_spec: "" # e.g., SPEC-412
---

# {{id}}: {{title}}

## 1. Objective & User Story

*(What is the high-level goal of this ticket? If applicable, frame it as a user story.)*

**As a** user setting up a new network,
**I want to** check if my desired subdomain name is available in real-time,
**So that** I can choose a unique name before submitting the creation form.

## 2. Acceptance Criteria (Gherkin Syntax)

*(This defines what "Done" means from a functional perspective. It should be specific and testable.)*

**Scenario 1: Subdomain is available**
- **Given** I am an authenticated user
- **And** the subdomain "my-new-network" does not exist in the database
- **When** I call the `checkSubdomainAvailability` procedure with "my-new-network"
- **Then** the procedure should return `{ available: true }`

**Scenario 2: Subdomain is taken (case-insensitive)**
- **Given** I am an authenticated user
- **And** a network with the subdomain "existing-network" already exists
- **When** I call the `checkSubdomainAvailability` procedure with "Existing-Network"
- **Then** the procedure should return `{ available: false }`

**Scenario 3: Invalid input**
- **Given** I am an authenticated user
- **When** I call the `checkSubdomainAvailability` procedure with an invalid subdomain like "My_Net!"
- **Then** the procedure should throw a tRPC input validation error

## 3. Technical Implementation Plan

*(Provide specific guidance for the engineer. This section is for implementation details, file paths, and code snippets.)*

- **File to Modify:** Create or update `apps/api/src/trpc/routers/network.router.ts`.
- **Router:** Nest the new `networkRouter` into the main `appRouter`.
- **Procedure:**
    - **Name:** `checkSubdomainAvailability`
    - **Type:** `protectedProcedure` (requires authentication).
    - **Input Schema (Zod):** `z.object({ subdomain: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/) })`
    - **Query Logic:** Use a case-insensitive `findFirst` or `count` query on the `Network` Prisma model.

## 4. Testing Requirements

*(What testing is required before this ticket can be considered complete?)*

- [ ] Add a new unit test file `network.router.test.ts`.
- [ ] Write unit tests covering all three acceptance criteria scenarios (available, taken, invalid input).
- [ ] Manually test the endpoint using the frontend (if applicable) or a tRPC client.

---

### Definition of Done Checklist

- [ ] All acceptance criteria are met.
- [ ] Required unit tests are written and are passing.
- [ ] Code has been peer-reviewed and approved.
- [ ] The feature has been deployed to the staging environment.
- [ ] This ticket has been moved to the `Done` column in the project board.
