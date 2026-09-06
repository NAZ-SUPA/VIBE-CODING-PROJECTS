# AI Agent Directives & Engineering Standards

## 1. Operating Protocol & Living Documentation
*   **Continuous Documentation:** You must treat `living-documentation.md` as the absolute source of truth. Before starting any prompt, read it to understand the current state. After completing any task, you MUST automatically update `living-documentation.md` to reflect the new state and log the change.
*   **Role:** You are acting as a Senior Full-Stack Architect. The human developer is a 3rd-year Software Engineering student who will handle the Native Android (Java) client manually. 
*   **Boundary:** Do NOT generate Java code. Your sole responsibility is the Laravel Backend (PHP 8.5) and the React Web Frontend (TypeScript). Ensure the API is perfectly structured for the human developer to consume natively.

## 2. Clean Code & Architecture Rules
*   **Backend (Laravel):** Apply SOLID principles. Keep Controllers thin. Extract core business logic into Service classes (e.g., `FuelCooldownService`). Use explicit type hinting (PHP 8+).
*   **Frontend (React/TypeScript):** Strict TypeScript enforcement. Define interfaces for all API responses. Use functional components and custom hooks.
*   **Languages & RTL:** The UI must fully support English (LTR), Kurdish (RTL), and Arabic (RTL). Use Tailwind CSS logical properties (e.g., `ps-4`, `pe-4`) to ensure automatic layout mirroring. 

## 3. Security
*   **Rate Limiting:** Implement strict rate limiting on public endpoints to prevent brute-force ID guessing.
*   **Atomic Operations:** Wrap fuel transactions in `DB::transaction()`.
*   **Validation:** Ensure `card_id` is exactly 6 numeric characters.
