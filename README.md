# Antigravity Dark 🌌

[English](#english) | [简体中文](#chinese)

---

<a name="english"></a>

# Antigravity Dark (Komari-Next Edition)

**Antigravity Dark** is a premium, high-performance frontend theme for the Komari monitoring project. Inspired by the concept of "Zero Gravity," it provides a floating, minimalist, and deeply immersive dark visual experience.

Built with **Next.js**, **TypeScript**, **Tailwind CSS v4**, and **Shadcn UI**.

[Demo](https://probes.top) | [Download Theme](https://github.com/bedlatess/Antigravity-Dark/releases/latest)

> **Note:** This is a frontend theme. A running Komari backend instance is required. For the best experience, upload the theme zip via your Komari admin dashboard.

![preview](https://github.com/tonyliuzj/komari-next/blob/main/preview.png?raw=true)

## ✨ Core Concepts

- **Weightless UI**: Floating card designs and smooth transitions that define the "Antigravity" aesthetic.
- **Deep Space Immersion**: A meticulously crafted dark mode that reduces eye strain while maintaining high contrast.
- **Dynamic Visualization**: Real-time server status, latency charts, and global maps.
- **Customizable DNA**: 6 Color themes and 4 unique card layouts to match your style.

## 🚀 Key Features

- **Global View**: Interactive maps to monitor your nodes worldwide.
- **Intelligent Dashboard**: Real-time stats for server load, uptime, and network latency.
- **Advanced Customization**:
  - **Themes**: Default, Ocean, Sunset, Forest, Midnight, Rose.
  - **Layouts**: Classic, Modern, Minimal, Detailed.
  - **Graphs**: Circle, Progress Bar, Bar Chart, Minimal.
- **Remaining Value**: Integrated calculator for server costs and value.
- **I18n Support**: Fully localized in multiple languages.
- **Responsive**: Perfect experience on Desktop, Tablet, and Mobile.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Static Export)
- **Styling**: Tailwind CSS v4 + Shadcn UI (Radix UI)
- **Charts**: Recharts
- **Logic**: TypeScript, RPC2 Client

## ⚙️ Development & Build

### Prerequisites
- **Node.js** 22+
- A running **Komari backend**

### 1. Setup
```bash
git clone [https://github.com/bedlatess/Antigravity-Dark.git](https://github.com/bedlatess/Antigravity-Dark.git)
cd Antigravity-Dark
npm install
```
### 2. Configure API
Create a .env.local file:
```bash
NEXT_PUBLIC_API_TARGET=http://your-backend-ip:25774
```
### 3. Run & Build
```bash
npm run dev   # Development
npm run build # Production export to /dist
```
