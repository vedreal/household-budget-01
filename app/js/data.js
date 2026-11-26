/* HomeLedger data: seeded demo for the Rivera family (November 2026)
 * plus a tiny localStorage store. One job: own the data. */
(function () {
  "use strict";

  var KEY = "homeledger-v1";

  var CATEGORIES = [
    "Housing", "Groceries", "Utilities", "Transport", "Dining Out",
    "Entertainment", "Health", "Kids", "Savings", "Personal"
  ];

  var CAT_COLORS = {
    "Housing": "#14532d", "Groceries": "#1d6b3c", "Utilities": "#2f7f5b",
    "Transport": "#b45309", "Dining Out": "#d97706", "Entertainment": "#92400e",
    "Health": "#0e7490", "Kids": "#6d28d9", "Savings": "#15803d",
    "Personal": "#64748b"
  };

  function tx(id, date, desc, category, amount, type) {
    return { id: id, date: date, desc: desc, category: category, amount: amount, type: type || "expense" };
  }

  function seed() {
    return {
      household: "The Rivera Family",
      month: "2026-11",
      budgets: {
        "Housing": 1850, "Groceries": 780, "Utilities": 420, "Transport": 410,
        "Dining Out": 260, "Entertainment": 180, "Health": 240, "Kids": 350,
        "Savings": 800, "Personal": 220
      },
      transactions: [
        tx(1, "2026-11-01", "November rent — Maple Court Apt 4B", "Housing", 1850),
        tx(2, "2026-11-01", "Paycheck — Daniel Rivera (City Transit)", "Income", 5400, "income"),
        tx(3, "2026-11-02", "Weekly shop — GreenMart", "Groceries", 132.40),
        tx(4, "2026-11-03", "Electricity bill — City Power", "Utilities", 145.00),
        tx(5, "2026-11-03", "Lunch — Taco truck with coworkers", "Dining Out", 48.20),
        tx(6, "2026-11-04", "Gas — Shell, 12.4 gal", "Transport", 45.00),
        tx(7, "2026-11-05", "Transfer to emergency savings", "Savings", 800),
        tx(8, "2026-11-05", "Gym membership — FitLife", "Health", 45.00),
        tx(9, "2026-11-06", "Movie night — two tickets + popcorn", "Entertainment", 36.00),
        tx(10, "2026-11-07", "Weekly shop — GreenMart", "Groceries", 98.75),
        tx(11, "2026-11-08", "Internet — FiberLink monthly", "Utilities", 79.00),
        tx(12, "2026-11-08", "Haircut — Daniel", "Personal", 35.00),
        tx(13, "2026-11-09", "School supplies — Mia & Leo", "Kids", 64.25),
        tx(14, "2026-11-10", "Gas — Chevron, 14.1 gal", "Transport", 52.30),
        tx(15, "2026-11-11", "Pharmacy — prescriptions", "Health", 42.30),
        tx(16, "2026-11-12", "Dinner — Bella Italia (anniversary)", "Dining Out", 64.75),
        tx(17, "2026-11-13", "Weekly shop — GreenMart", "Groceries", 145.20),
        tx(18, "2026-11-14", "Streaming — MovieBox monthly", "Entertainment", 15.99),
        tx(19, "2026-11-14", "Soccer fees — Leo, fall season", "Kids", 75.00),
        tx(20, "2026-11-15", "Freelance design — Priya, invoice #41", "Income", 950, "income"),
        tx(21, "2026-11-15", "Water bill — City Water", "Utilities", 68.00),
        tx(22, "2026-11-16", "Coffee — corner cafe, 2x", "Personal", 18.40),
        tx(23, "2026-11-16", "Weekly shop — GreenMart", "Groceries", 87.30),
        tx(24, "2026-11-17", "Dentist copay — Mia checkup", "Health", 85.00),
        tx(25, "2026-11-18", "Concert tickets — The Willow Band", "Entertainment", 120.00),
        tx(26, "2026-11-18", "Parking — downtown garage", "Transport", 25.00),
        tx(27, "2026-11-19", "Takeout — Thai Orchid", "Dining Out", 32.50),
        tx(28, "2026-11-20", "Refund — returned jacket (NorthPeak)", "Income", 500, "income"),
        tx(29, "2026-11-20", "Phone bill — MobilePlus, 2 lines", "Utilities", 120.00),
        tx(30, "2026-11-20", "Weekly shop — GreenMart", "Groceries", 121.55),
        tx(31, "2026-11-21", "Kids' clothes — fall jackets", "Kids", 89.99),
        tx(32, "2026-11-21", "Gas — Shell, 10.2 gal", "Transport", 38.75),
        tx(33, "2026-11-22", "Board game — Family Game Night", "Entertainment", 28.50),
        tx(34, "2026-11-22", "Bus pass — monthly, Daniel", "Transport", 60.00),
        tx(35, "2026-11-23", "Lunch — sushi with Priya", "Dining Out", 28.90),
        tx(36, "2026-11-23", "Vitamins & first aid", "Health", 23.40),
        tx(37, "2026-11-24", "Weekly shop — GreenMart", "Groceries", 76.80),
        tx(38, "2026-11-24", "Car wash + vacuum", "Transport", 18.00),
        tx(39, "2026-11-25", "Field trip — Mia, science museum", "Kids", 35.00),
        tx(40, "2026-11-25", "Takeout — pizza night", "Dining Out", 41.30),
        tx(41, "2026-11-26", "Clothing — Priya, work blouse", "Personal", 74.50),
        tx(42, "2026-11-26", "Books — Leo, two paperbacks", "Personal", 22.99)
      ],
      bills: [
        { id: 1, name: "Rent — Maple Court Apt 4B", amount: 1850, dueDay: 1, category: "Housing", paid: true },
        { id: 2, name: "Gym — FitLife", amount: 45, dueDay: 5, category: "Health", paid: true },
        { id: 3, name: "Internet — FiberLink", amount: 79, dueDay: 8, category: "Utilities", paid: true },
        { id: 4, name: "Electricity — City Power", amount: 145, dueDay: 12, category: "Utilities", paid: true },
        { id: 5, name: "Water — City Water", amount: 68, dueDay: 15, category: "Utilities", paid: true },
        { id: 6, name: "Streaming — MovieBox", amount: 15.99, dueDay: 18, category: "Entertainment", paid: false },
        { id: 7, name: "Phone — MobilePlus", amount: 120, dueDay: 20, category: "Utilities", paid: false },
        { id: 8, name: "Car insurance — SafeDrive", amount: 165, dueDay: 25, category: "Transport", paid: false }
      ],
      goals: [
        { id: 1, name: "Emergency fund", target: 10000, saved: 6200, note: "6 months of essentials" },
        { id: 2, name: "Family vacation — Oregon coast", target: 3500, saved: 1150, note: "Trip in July 2027" },
        { id: 3, name: "New car down payment", target: 8000, saved: 2400, note: "Replace the 2012 sedan" },
        { id: 4, name: "Kids' college fund", target: 25000, saved: 4800, note: "Mia & Leo, 529 plan" }
      ],
      history: [
        { month: "2026-06", income: 6700, spending: 5120 },
        { month: "2026-07", income: 6720, spending: 5340 },
        { month: "2026-08", income: 6850, spending: 5480 },
        { month: "2026-09", income: 6800, spending: 5210 },
        { month: "2026-10", income: 6900, spending: 5620 },
        { month: "2026-11", income: 6850, spending: 4990.02 }
      ]
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && d.transactions && d.budgets) return d;
      }
    } catch (e) { /* corrupted storage: reseed below */ }
    var fresh = seed();
    save(fresh);
    return fresh;
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full/blocked */ }
  }

  function reset() {
    var fresh = seed();
    save(fresh);
    return fresh;
  }

  /* --- query helpers (read-only views over the stored data) --- */
  function monthTx(data, month) {
    return data.transactions.filter(function (t) { return t.date.slice(0, 7) === month; });
  }
  function sumIncome(data, month) {
    return monthTx(data, month).filter(function (t) { return t.type === "income"; })
      .reduce(function (s, t) { return s + t.amount; }, 0);
  }
  function sumSpending(data, month) {
    return monthTx(data, month).filter(function (t) { return t.type !== "income"; })
      .reduce(function (s, t) { return s + t.amount; }, 0);
  }
  function spentByCategory(data, month) {
    var out = {};
    CATEGORIES.forEach(function (c) { out[c] = 0; });
    monthTx(data, month).forEach(function (t) {
      if (t.type !== "income" && out[t.category] !== undefined) out[t.category] += t.amount;
    });
    return out;
  }
  function nextId(items) {
    return items.reduce(function (m, it) { return Math.max(m, it.id || 0); }, 0) + 1;
  }

  window.HLData = {
    CATEGORIES: CATEGORIES,
    CAT_COLORS: CAT_COLORS,
    load: load,
    save: save,
    reset: reset,
    monthTx: monthTx,
    sumIncome: sumIncome,
    sumSpending: sumSpending,
    spentByCategory: spentByCategory,
    nextId: nextId
  };
})();
