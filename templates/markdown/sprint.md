---
id: {{id}} # e.g., 2024.03
title: "{{title}}"
status: "Planning" # Options: Planning, Active, Completed, Canceled
start_date: "{{date}}"
end_date: "{{endDate}}" # Folio can auto-calculate this, e.g., start_date + 14 days
epic_focus: "" # Primary epic this sprint contributes to, e.g., EPIC-001
total_points_committed: 0
points_completed: 0 # To be updated during the sprint
---

# Sprint Plan: {{title}}

## 1. 🎯 Sprint Goal & Focus

*(What is the single most important thing we want to achieve? This should be a clear, concise statement that guides our decisions throughout the sprint.)*

The primary goal of this sprint is to **deliver a functional end-to-end user registration and login flow**. By the end of this sprint, a new user should be able to create an account, log in, and receive a valid session token. This work primarily supports the **{{epic_focus}}** epic.

## 2. 📊 At a Glance: Sprint Metrics

- **Committed Points:** {{total_points_committed}}
- **Completed Points:** {{points_completed}}
- **Team Capacity:** 100%

## 3. 🎫 Scope & Ticket Breakdown

*(This section is automatically generated and updated by running `folio sprint sync {{id}}`. Do not edit manually.)*

<!-- FOLIO:SPRINT_TICKETS:START -->

| ID | Title | Owner | Points | Status |
|----|-------|-------|--------|--------|
|    |       |       |        |        |

<!-- FOLIO:SPRINT_TICKETS:END -->

## 4. 🗓️ Key Events & Schedule

- **Sprint Planning:** {{start_date}}
- **Daily Standups:** Daily @ 10:00 AM EST
- **Sprint Review / Demo:** {{endDate}} @ 2:00 PM EST
- **Sprint Retrospective:** {{endDate}} @ 3:00 PM EST

## 5. ⚠️ Risks & Dependencies

*(What internal or external factors could jeopardize the sprint goal?)*

- **Risk:** The choice of JWT library has not been finalized, which could block `SPEC-102`. A decision is needed by Day 2 via `ADR-003`.
- **Dependency:** Awaiting the DevOps team to provision the new PostgreSQL database (related to `TICKET-SYS-50`).

---

## 🏁 Sprint Review & Retrospective (To be filled out at end of sprint)

### What We Shipped (Demo Notes)

*(A summary of the completed work demonstrated to stakeholders.)*

- Demonstrated the full user registration and login flow.
- Showcased the new protected API endpoints.
- Finalized the design for the "Forgot Password" modal.

### What We Learned (Retrospective)

- **What went well?** The ADR process for choosing the database was very effective and prevented debate during the sprint.
- **What could be improved?** Feature specs need to have UI/UX links earlier in the process to avoid blocking frontend work.
- **Action Item for Next Sprint:** Product will ensure Figma links are in specs *before* the sprint planning meeting.
