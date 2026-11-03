# Ehata CRM

Front end for Ehata, a CRM for real-estate developers: agent workspace, pipeline, leads, inventory, bookings, management insights, settings and a brandable public inventory site.

Built with React, TypeScript, Vite and React Router. Styling is plain CSS on the design tokens in `src/styles/tokens.css` (light and dark values for every token).

```bash
npm install
npm run dev
```

## Structure

- `src/styles/` — `tokens.css` (design tokens), `base.css`, `components.css` (buttons, chips, tables, overlays…), `shell.css` (top bar, side nav, icon rail, bottom tabs), `pages.css`
- `src/components/` — shared UI: `AppShell`, `AppTopBar`, `AppSideNav`, `Icon`, `ui.tsx` (Chip, StageBadge, Age, UnitTag, Panel, Modal, Drawer, Sheet, DisabledWhy, Pagination…), `LogCall`, `InsightFilters`
- `src/pages/` — one file per screen
- `src/data/` — sample data used by the screens (no backend yet)
- `src/lib/` — session/role context, role-aware navigation and access, toasts

## Routes

| Route | Screen |
| --- | --- |
| `/login` | Sign in + organisation selection |
| `/my-day` | Agent "My day" / manager "Team today" |
| `/pipeline` | Kanban with drag-and-drop, Lost/Nurture drop zones, keyboard moves |
| `/leads`, `/leads/:id` | Leads table (saved views, bulk actions) and lead profile |
| `/inventory` | Tower › floor › unit grid, unit panel, price-list editor |
| `/bookings` | Bookings & instalments |
| `/dashboard`, `/leaks`, `/heatmap`, `/scorecards` | Management insights (shared, persistent filters) |
| `/settings` | Users & roles, stages & SLAs, integrations, assignment rules, audit log |
| `/m`, `/m/lead`, `/m/log` | Agent mobile (390) |
| `/site`, `/site/unit/:code` | Public inventory site (map + list, unit detail with calculator). `?brand=7A2E1F` previews another brand colour |
| `/design-system`, `/states`, `/roles` | Reference screens |

Use the user menu (top right) to view the app as Agent, Sales Manager, Owner/Admin, Dealer or Finance, and to switch dark mode. Navigation, landing page and permissions follow the role.
