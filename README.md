# Firewall Data Dashboard

A responsive React + Ant Design dashboard for managing firewall-related reports and user data.

## Overview

This project includes:

- Authentication with a login page
- Protected routes (only authenticated users can access dashboard pages)
- A **Report** module with:
  - Summary cards (agreed payment, paid amount, debt)
  - CRUD operations (create, edit, delete)
  - Responsive table/card layout
  - Expandable details in desktop table rows
- A **Users** module with:
  - CRUD operations
  - Responsive table/card layout
- A **User Account** module with:
  - Profile information form
  - Avatar upload
  - Security tab with password change form

## Tech Stack

- React 18
- Vite 5
- Ant Design 5
- React Router 6

## Project Structure

Key folders:

- `src/pages/Report` – report management UI
- `src/pages/User` – users list and account pages
- `src/pages/Auth` – login page
- `src/router` – application routes and route guarding
- `src/components` – shared UI components

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

### 3) Build for production

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

## Authentication

Use the following demo credentials on the login page:

- **Username:** `admin`
- **Password:** `admin123`

Authentication state is stored in `localStorage` (`fw_auth`).

## Available Routes

- `/login` – login page
- `/report` – reports dashboard
- `/user/users` – users management
- `/user/account` – account settings
- `/files` – files page

Unauthenticated users are redirected to `/login`.

## Notes

- The UI is optimized for desktop, tablet, and mobile screens.
- Some report values are currently mock/demo data.
- You can replace static data with API integration as the next step.

## License

This project is private/internal unless you define a separate license.
