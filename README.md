# Assignment #5: JavaScript Basics (DOM Manipulation & Events)

**Institution:** Astana IT University  
**Course:** Web Technologies (Front-End Development) — Part 2  
**Instructor:** Abitova G.A.  
**Student:** Aitpayev Tamerlan  
**Academic Group:** IT-2510  
**Repository:** [https://github.com/tamerlanaitpayev1-netizen/web5](https://github.com/tamerlanaitpayev1-netizen/web5)  

---

## Executive Summary & Deliverables

This repository contains the complete implementation of **Assignment #5** built strictly using vanilla ES6+ JavaScript, semantic HTML5, and bespoke CSS with zero external libraries or frameworks (no jQuery, no Tailwind, no React).

The design follows a high-contrast **Naval Blue and White** editorial theme, compliant with WCAG AAA accessibility standards and verified across mobile (375px) and desktop (1280px) viewports with zero horizontal scrolling.

### Submitted Files
- `index.html` — Central navigation hub and project portfolio dashboard
- `task1.html` + `task1.js` — **Task 1 (Option B):** Turn-based tactical combat simulator
- `task2.html` + `task2.js` — **Task 2 (Option A):** Data-driven Kanban board with WIP limit & event delegation
- `task3.html` + `task3.js` — **Task 3 (Option A):** Conference pass generator with live validation & boarding pass preview
- `style.css` — Universal design system and component stylesheet (Naval Blue & White)
- `Assignment5_Aitpayev_Tamerlan.docx` — Official Word submission report
- `Assignment5_Aitpayev_Tamerlan.pdf` — Official PDF submission report
- `screenshots/` — High-resolution evidence captures across all tasks and viewports

---

## Task Details & Technical Specifications

### Task 1: Turn-Based Combat (Option B)
- **Combatants:** Valiant Hero and Shadow Overlord, both initialized to 100 HP.
- **Actions:**
  - `Strike`: Deals 8–15 fair random physical damage (`Math.floor(Math.random() * (15 - 8 + 1)) + 8`). A 10% critical strike probability inflicts double damage (`2.0x`).
  - `Defend`: Halves the next incoming hit from the enemy (50% damage reduction).
  - `Heal`: Restores 20 HP, strictly capped at 3 charges per match. Invalid attempts (0 charges remaining or already at 100 HP) are rejected with clear messages without consuming the turn.
- **AI Counter-attack:** Enemy strikes back for 5–14 damage with its own 10% critical strike check.
- **Outcomes Evaluated with `&&`, `||`, and `===`:**
  - *Draw:* `if (currentHeroHp <= 0 && currentEnemyHp <= 0)`
  - *Victory:* `else if (currentEnemyHp <= 0 && currentHeroHp > 0)`
  - *Defeat:* `else if (currentHeroHp <= 0 || (currentEnemyHp > 0 && currentHeroHp === 0))`
- **Restart:** Restarts match state cleanly in-memory without reloading the page.

---

### Task 2: Data-Driven Kanban Board (Option A)
- **Data Source:** Initial array of 12 objects with unique IDs and multiple data types (`Number`: `id`, `storyPoints`; `String`: `title`, `priority`, `tag`, `column`, `assignee`; `Boolean`: `isBlocked`).
- **Empty Markup:** HTML has only empty structural containers (`#todo-cards-container`, `#progress-cards-container`, `#done-cards-container`).
- **Zero `innerHTML` for Data:** All cards, tags, badges, and controls are created exclusively with `document.createElement`, `textContent`, `classList`, and `dataset`.
- **WIP Limit Rule:** The "In progress" column enforces a strict maximum of 3 cards (`WIP_LIMIT = 3`). Moving a fourth card into "In progress" is blocked with a warning alert.
- **Manual Loop Calculation:** Explicit `for...of` loop computes total tasks, completed count, story point velocity, and completion percentage.
- **Event Delegation:** A single container listener on `#kanban-board-container` processes all card actions (`data-action="move-forward"`, `data-action="move-backward"`, `data-action="delete-card"`).

---

### Task 3: Live Pass Builder & Validation (Option A)
- **7 Form Controls:** Event summit, event date, pass tier, quantity, full name, email, and promo code.
- **Live Boarding Pass Preview:** Synchronizes immediately on every keystroke (`input` and `change` events).
- **Four Non-HTML Rules:**
  1. *Dynamic Seat Inventory:* Requested quantity cannot exceed remaining seats in the active tier object (e.g., maximum 4 VIP seats).
  2. *Blackout & Lead-Time Restriction:* Dates in the blackout registry (`2026-11-15`, `2026-12-25`, `2026-12-31`) or less than 2 days in advance are rejected.
  3. *Promo Code Registry:* Optional promo code is validated against `AITU20` (20% off), `DEV2026` (15% off), or `STUDENT50` (50% off).
  4. *Multi-Token Legal Name:* Must consist of at least two words (First + Last), min 2 characters per word, alphabetical letters only.
- **Validation Pipeline:** No errors on initial page load. Validated on `blur`, then live on `input` with `aria-invalid` and `.field-error` elements.
- **Constraint Validation API:** Native browser popups suppressed with `form.noValidate = true;` while programmatic checks (`setCustomValidity`, `checkValidity`) operate fully.
- **On Submit:**
  - If invalid: Count of errors displayed at top alert banner and focus transfers to first invalid field.
  - If valid: Dynamic confirmation receipt card created via DOM methods with unique reference code (`TKT-2026-XXXXX`), and form resets.

---

## Task 3 Rules Matrix

| Field | Rule Description | Valid Example | Invalid Example & Feedback |
| :--- | :--- | :--- | :--- |
| **Pass Tier & Quantity** | Dynamic seat inventory: Quantity cannot exceed remaining seats for chosen pass tier. | VIP Pass with `Quantity = 3` (4 available) | VIP Pass with `Quantity = 5` (*"Capacity exceeded: Only 4 VIP seats remaining in inventory"*) |
| **Event Date** | Sold-out & lead-time: Dates in blackout array or less than 2 days in advance are rejected. | `2026-11-20` (Active summit day) | `2026-11-15` (*"This date is completely sold out or closed for registration"*) |
| **Promo Code** | Registry verification: Optional code must exist in promotional registry to apply discount. | `AITU20` (20% off), `STUDENT50` (50% off) | `PROMO99` (*"Unrecognized promo code. Try AITU20 or STUDENT50"*) |
| **Full Name** | Multi-token structure: At least two words (First + Last), min 2 chars per token, letters only. | `Tamerlan Aitpayev`, `Айтпаев Тамерлан` | `Tamerlan` (*"Please enter both your First Name and Last Name"*) |

---

## Computational Complexity (Big-O)

| Module / Operation | Time Complexity | Auxiliary Space | Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Task 1: Combat Turn** | $O(1)$ | $O(1)$ | Immediate mathematical evaluations, array log capped at 5 items |
| **Task 2: Metrics Loop** | $O(N)$ | $O(1)$ | Single linear pass through array of $N$ tasks |
| **Task 2: Priority Sorting** | $O(N \log N)$ | $O(N)$ | Optimized TimSort over task priority weights |
| **Task 2: DOM Rendering** | $O(N)$ | $O(N)$ | Direct node construction via `createElement`, zero parser teardown |
| **Task 2: Event Delegation** | $O(1)$ | $O(1)$ | Single event listener attached to parent container |
| **Task 3: Field Validation** | $O(1)$ | $O(1)$ | Constant set of 7 fields evaluated against regex and lookup tables |

---

## Local Execution Instructions

1. Clone or download the repository:
   ```bash
   git clone https://github.com/tamerlanaitpayev1-netizen/web5.git
   cd web5
   ```
2. Serve via any local HTTP server:
   ```bash
   python -m http.server 8080
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8080/index.html
   ```

---
*Astana IT University • Department of Computer Engineering • 2026*
