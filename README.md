# VTC Tracker

A modern, open-source job tracking frontend for Euro Truck Simulator 2 (ETS2) and American Truck Simulator (ATS) Virtual Trucking Companies (VTCs).

## Features

- **Job Tracking**: Log deliveries with distance, revenue, and damage stats.
- **Convoys**: Schedule and manage group events with signups.
- **Leaderboards**: Compete with other drivers for distance and revenue.
- **Fleet Management**: Manage your trucks and trailers.
- **Role-based Access**: Separate views for Drivers, Managers, and Owners.
- **Mock Mode**: Fully functional offline mode for development and testing without a backend.
- **Modern UI**: Dark mode gaming aesthetic built with Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Validation**: Zod
- **Icons**: Lucide React
- **Auth/Data**: Supabase (Abstracted via API layer)

## Getting Started

### Prerequisites

- Node.js 20+
- Bun (recommended) or npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/tracker.git
   cd tracker
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Configure environment:

   ```bash
   cp .env.local.example .env.local
   ```

   By default, this sets up **Mock Mode** (`NEXT_PUBLIC_API_MODE=mock`), which allows you to run the full app without any backend infrastructure.

4. Start the development server:

   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Mock Mode Credentials

When running in Mock Mode, you can log in with these pre-seeded accounts:

- **Owner**: `mock-owner@example.com` / `password123`
- **Driver**: `mock-driver@example.com` / `password123`

## Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login/Register pages
│   └── (dashboard)/      # Protected app pages
├── components/           # React components
│   ├── ui/               # Reusable UI primitives
│   └── layout/           # Header, Sidebar, etc.
├── lib/                  # Core logic
│   ├── api/              # API boundary (Mock & Real implementations)
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand stores
│   └── types/            # TypeScript definitions
└── public/               # Static assets
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
