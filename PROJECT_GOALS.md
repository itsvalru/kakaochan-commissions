# KakaoChan Commission Website

This is a commission and merch platform for KakaoChan, a VTuber with a vampire-wolf aesthetic and NSFW/SFW offerings.

## Features & Goals

### Commission system with a dynamic step-by-step form

Fully schema-driven: supports any number of categories, types, and subtypes

Commission path (category → type → optional subtype)

Flexible pricing engine with optional inputs and add-ons

Inputs can be booleans, lists, or free-form text

Special fields: references, extra info, streaming permission, usage type

Optional character count logic with max + per-character cost

Pricing dynamically calculated and saved in real time

Form progress saved to localStorage until final submission

### Ticket System

- Each commission creates a separate chat-style ticket
- Users and Kakao can exchange messages & media
- Timeline view for updates (e.g., Sketch uploaded, awaiting feedback)

### Progress Board

- Custom Trello-style progress board
- Admin-only view with drag-and-drop status management
- Public-facing status view for users (opt-in)

### Merch Tab (Planned)

- Separate tab for digital or physical product sales

## Auth & Session

- Login via Supabase OAuth (Discord & Google)
- Magic link login (email only)
- No passwords

## UI & Theme

- Dark theme with black and red vampire-goth styling
- Mobile-friendly and responsive
- Clean and aesthetic matching KakaoChan branding

## Admin Features (Dashboard)

- Admin-only dashboard view for KakaoChan
- Manage all commission tickets (active, pending, completed)
- Add new commission types with full configuration
- Disable or delete commission types
- Update pricing, descriptions, add-ons
- Update commission statuses (e.g., In Progress to Completed)
- Post replies or media to tickets (chats)
- View timeline updates per commission

## Security & Architecture

- Uses Supabase RLS to restrict commission data per user
- Admin routes restricted by role flags
- Auth handled at middleware level and inside SSR routes
- Minimal client-only components
- Clean separation of logic, UI, and context

## Tech Stack

- Next.js App Router
- Supabase (Auth, DB, Storage)
- Tailwind CSS
- Typescript & React
- Lemon Squeezy (planned for payments)
- Supabase RLS for per-user data control
