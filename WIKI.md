# Pilates Vision & Progress - Project Wiki (Interaction Log)

## Scope
This wiki documents our full collaboration history for the **Pilates Vision & Progress** prototype, including requirements, implementation phases, technical decisions, bug fixes, UX refinements, and deployment preparation.

## 1. Project Initialization
### Initial request
Build a full prototype with:
- `backend/` and `frontend/` directories
- FastAPI + SQLite backend
- React (Vite) + Tailwind frontend
- Zen/Wellness visual style (sage, soft whites, slate grays)
- Student onboarding stepper
- Mock AI posture analysis flow
- Dashboard with real data widgets
- Loading states, modular architecture, and clean code
- `requirements.txt`, `package.json`, and robust `.gitignore`
- Python virtual environment setup under `backend/.venv`

### Core backend scope (initial)
- Models:
  - `Student` (name, CPF, DOB, phone, medical notes)
  - `Assessment` (student_id, image_url, postural_notes, created_at)
- Endpoints:
  - `POST /students`
  - `GET /students`
  - `POST /analyze` mock endpoint with 3-second delay returning static analysis JSON

### Core frontend scope (initial)
- Sidebar with sections:
  - Dashboard
  - Student Management
  - Postural Analysis
  - Training Plans
- Student registration stepper:
  - Step 1 Personal Info
  - Step 2 Medical History
  - Step 3 Goals
- AI visualizer:
  - Upload area
  - Progress bar during analysis
  - Scanning animation on image
  - Overlay keypoints after response
- Dashboard:
  - Stats cards
  - Today schedule table

## 2. Containerization and Runtime
### Added requirements
- Backend Dockerfile
- Frontend Dockerfile
- Root `docker-compose.yml`
- Expose:
  - Frontend on `5173`
  - Backend on `8000`
- Persist SQLite data with Docker volume

### Outcome
Containerized setup established and later updated to support broader feature growth and persistence for new entities.

## 3. Feature Expansion: Instructors, Search, Scheduling
### Backend expansion
- Added `Instructor` model
- Added `Appointment` model
- Added search support to `GET /students`
- CRUD endpoints for instructors and appointments
- Updated DB/model bootstrapping to support new tables

### Frontend expansion
- Instructor Management page (register + list)
- Student search with live API filtering as user types
- Schedule tab with calendar-like booking flow
- Booking modal with:
  - searchable student selector
  - instructor selector
- Maintained existing aesthetic across new pages

## 4. Appointment Detail + Status Workflow
### Added behavior
On schedule appointment click:
- Open detail modal showing:
  - Student
  - Instructor
  - Time
  - Status
- Edit action:
  - change status/time
- Delete action:
  - confirmation dialog

### Status model update
Appointments now support:
- `booked`
- `completed`
- `canceled`

### UX addition
- Elegant status legend component at top of schedule page

## 5. Critical Backend Fix
### Reported issue
- FastAPI startup failure:
  - `AssertionError: Status code 204 must not have a response body`

### Resolution
- Endpoint response behavior adjusted to ensure 204 responses do not return body payloads.

## 6. CRUD Improvements + Safety UX
### Added
- Edit/Delete for both Students and Instructors
- Deletion guardrails
- Better user feedback with toasts

## 7. Training Plans Flow Redesign
### Request
Require student selection before plan generation.

### Implemented
- Student select dropdown at top
- Disable `Generate Plan` until selection
- Show Student Profile card after selection:
  - Name
  - Age
  - Goal

## 8. Theme System Evolution
### Phase 1
- Added global dark/light mode toggle using Tailwind.

### Phase 2
- Refactored theme handling:
  - removed global CSS dark overrides
  - migrated components to explicit Tailwind `dark:` utility classes

## 9. Internationalization (EN/PT)
### Added
- Full UI translation support (English/Portuguese)
- LocalStorage persistence for language preference
- Sidebar language switcher (EN | PT)
- Translation coverage:
  - Sidebar labels
  - Dashboard stats
  - Student/Instructor forms
  - Table headers
  - Postural analysis UI

## 10. External Access / Ngrok
### Requirement
- Allow Vite host access from ngrok.

### Fix
- Updated Vite host allowlist (`server.allowedHosts`) to include required ngrok hostname(s), resolving blocked-host 403 errors.

## 11. Responsive Navigation Overhaul
### Implemented
- Collapsible/responsive sidebar
- Theme + language toggles moved to top header
- Header kept opposite sidebar layout
- Sticky mobile header for quick access to language/theme controls

## 12. Single-Container Deployment Readiness
### Request
Prepare app for Hugging Face-style single-container deployment.

### Outcome
- Runtime and container structure adapted for hosted single-container target while preserving multi-service workflow where needed.

## 13. Stability Fixes
### Issues addressed
- 422 Unprocessable Entity API error during student registration
- React crash (`Error #31`) in registration flow

### Result
- Input payload and component state logic adjusted to avoid invalid request shape and frontend crash path.

## 14. Data Validation Enhancements
### Student form
- CPF masking: `xxx.xxx.xxx-xx`
- Digit-only handling
- Phone digit-only handling

### Dashboard integration
- Connected to backend for live data:
  - total active students
  - today’s scheduled sessions
- Added card shortcuts/navigation actions

### Name/phone strict validation
- Names restricted to letters + spaces (including accents)
- Phone restricted to numeric input
- Localized validation errors

### Analysis bilingual response behavior
- Analysis result language now updates immediately when EN/PT toggle changes.

### Phone minimum length
- Enforced min 10 digits in create/edit flows for students and instructors.

### CPF consistency
- Applied same CPF mask/standardization in student edit flow.
- Applied CPF mask formatting in students summary table.

## 15. Session Gate + Login Experience
### Added authentication gate (username-based)
- App now conditionally renders:
  - Login screen when no user
  - Main app when user exists
- Username persisted in localStorage
- Header shows current username and logout button (`Sair`)
- Logout clears localStorage and returns immediately to login

### Login UI upgrades
- Added language + theme toggles directly on login screen
- Dynamic localized greeting:
  - PT: `Olá, {name}`
  - EN: `Hello, {name}`
- Smooth light/dark transitions
- Styled inputs/buttons for both themes
- Added post-login loading screen (about 1.7 seconds) with theme awareness

### Localization completion for login/loading
- Moved login/loading strings to i18n
- Ensured instant language updates
- Kept brand string static as requested:
  - `Vision & Progress Pilates Studio`

### Dashboard greeting localization
- Added dynamic localized greeting for logged-in user on dashboard:
  - PT: `Olá, {{name}}`
  - EN: `Hello, {{name}}`

### Global header greeting localization
- Replaced static `Hello` in top header with translation key-based greeting
- Immediate EN/PT reactivity via i18n hook

## 16. Field Limits and Validation Hardening
### Student forms (create + edit)
- Name: `maxLength=100` + live counter (`x/100`, red at limit)
- Phone: `maxLength=15` (mask-aware)
- Medical History: `maxLength=500`
- Goals: `maxLength=500`
- Added counters for long text fields where applicable

### Instructor forms (create + edit)
- Name: `maxLength=100` + live counter (`x/100`, red at limit)
- Phone: `maxLength=15`
- Email: `maxLength=100` + explicit email format validation
- Specialty: `maxLength=100`
- Notes: `maxLength=500`

### Translation update
- Added `validation.emailInvalid` EN/PT message key.

## 17. Documentation Work (README)
### Requested rubric alignment
README was expanded to include:
- Problem and proposed solution
- Design choices and alternatives
- What worked well with coding-agent usage
- What did not work and manual interventions
- Effective coding-agent usage strategy

### Professional rewrite + deployment link
- README was rewritten in a more professional tone.
- Hugging Face deployment link added:
  - https://huggingface.co/spaces/MateusZanco/pilates-vision-progress

### Architecture section added
- Added project tree section describing each major folder/file role.

## 18. Tooling / Environment Notes
- Some local validation commands could not run due host machine policy:
  - PowerShell execution policy blocked `npm.ps1` (`npm run build`).
- Code updates continued with static checks and targeted file verification.

## 19. Key Product Characteristics (Current)
- Full-stack prototype with modular structure
- Bilingual UI (EN/PT), persisted preferences
- Theme toggling (light/dark), responsive shell
- Real CRUD for students/instructors/appointments
- Schedule management with status lifecycle
- Dashboard connected to backend metrics
- AI analysis mock path ready for model integration
- Containerized and prepared for hosted deployment patterns

## 20. Future Recommendations
- Add automated tests:
  - Backend unit/integration tests (FastAPI + DB)
  - Frontend component and flow tests
- Add CI pipeline with lint/test/build gates
- Replace mock AI endpoint with real inference service
- Improve role-based access control beyond username gate
- Add observability (structured logs + error tracking)

