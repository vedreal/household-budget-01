[![HomeLedger](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/vedreal/household-budget-01/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/vedreal/household-budget-01/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

# HomeLedger

A household budget site for the Rivera family — plain static files, no
network requests, no framework. Open `app/index.html` in a browser (or serve
`app/` with any static server) and it just works, on desktop and on phone.

## What it does

- **Dashboard** — this month's income vs spending, money remaining, savings
  rate, a category donut and a 6-month bar chart, upcoming bills with
  one-tap "Mark paid", savings-goal progress, recent transactions, and a
  quick-add transaction form. Month prev/next included.
- **Transactions** — search, filter by category and type, sort, add, edit
  and delete, with a running balance.
- **Budget** — a monthly budget per category with progress bars and
  over/under amounts; edit any budget inline.
- **Bills** — recurring bills with due dates, mark paid/unpaid, add and
  delete, monthly total at a glance.
- **Goals** — savings goals with progress, add a contribution, add and
  delete goals.
- **Reports** — 6-month income-vs-spending chart, category breakdown, and
  computed insights (top category, average daily spend, savings rate,
  projected month-end balance).

All data lives in `localStorage`; a "Reset demo data" button restores the
seeded November 2026 demo (income $6,850, 42 transactions, 8 bills,
4 goals, 6 months of history).

## Layout

- `app/index.html` — page shell and navigation
- `app/css/style.css` — all styling (deep green + warm cream + amber)
- `app/js/data.js` — seed data and the localStorage store
- `app/js/format.js` — money and date formatting
- `app/js/charts.js` — canvas donut, bar and trend charts
- `app/js/views/` — one file per page (dashboard, transactions, budget,
  bills, goals, reports)
- `app/js/router.js` — hash routing and nav state
- `app/js/app.js` — bootstrap
- `main.ts` — copies `app/` and `screenshots/` to the output directory and
  writes `dossier.json` (Node 22, stdlib only)
- `screenshots/` — 4 real renders of the site (desktop + phone)

## Bounty

Built for [best-household-budget-site-20261126-1457](https://make.fun/bounty/best-household-budget-site-20261126-1457) — referral code `f2pdfak6`.
