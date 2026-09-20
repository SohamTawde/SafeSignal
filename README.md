# Nirbhaya 🛡️

**Nirbhaya** is an anonymous, proactive women-safety early-warning platform. 
It replaces traditional reactive reporting (calling the police *after* an incident) with a frictionless, privacy-first system that detects emerging threats in real-time.

---

## 🚀 The Problem & Our Solution
Most safety apps require users to create accounts, log in, verify OTPs, and provide exact GPS tracking. This creates **friction** and **privacy concerns** (fear of backlash), which deters women from reporting early warning signs like catcalling, stalking, or suspicious behavior.

**Nirbhaya solves this by:**
1. **Zero-Friction Reporting:** No app installation or account required for citizens. 2 taps to report.
2. **100% Anonymity:** We do not collect names, emails, phone numbers, or exact GPS coordinates.
3. **AI Pattern Engine:** Individual anonymous reports are mathematically aggregated using our custom "Trust Score Engine" to form high-confidence "Emerging Patterns" for authorities.

---

## ✨ Key Features

### 🦸‍♀️ For Citizens (Public Interface)
- **Frictionless Anonymous Reporting:** Simple, massive UI designed for panic situations.
- **Privacy-First Geolocation:** Device location is obfuscated into a 20x20 meter `grid_zone`. Exact coordinates are never saved to the database.
- **Public Safety Map:** Citizens can view a real-time heatmap of recent alerts to choose safer walking routes.

### 👮‍♂️ For Authorities (Dashboard)
- **Real-Time Interactive Map:** A beautiful dark-mode map powered by Leaflet, displaying live threat zones (Yellow = Emerging, Orange = Under Review, Red = Critical).
- **Human Review Queue:** Authorities can review AI-generated patterns and validate or dismiss them.
- **Signal Confidence Engine:** An anti-gaming algorithm that scores patterns based on *Reporter Diversity*, *Time Spread*, and *Category Diversity* rather than raw volume, preventing spam attacks.

---

## 🛠️ Technology Stack
- **Frontend:** React.js, Vite, TailwindCSS (for modern, dynamic, glassmorphism UI)
- **Maps:** React-Leaflet & OpenStreetMap (custom dark-mode filters)
- **Backend & Database:** Supabase (PostgreSQL)
- **Realtime:** Supabase Realtime WebSockets
- **Authentication:** Supabase Auth (for Authority Portal only)
- **Testing:** Vitest

---

## 📂 Project Structure
```
Nirbhaya/
├── src/
│   ├── components/      # Reusable UI components (Buttons, GlassCards, Map)
│   ├── contexts/        # React Contexts (AuthContext)
│   ├── pages/           # Main Views (Landing, Authority Dashboard, etc.)
│   ├── services/        # Core Logic (API calls, Pattern Engine, Trust Score)
│   └── config/          # Configurations (Trust Score Weights)
├── supabase/
│   ├── migrations/      # SQL files to set up the DB Schema
│   └── seed.sql         # Mock data for demonstration
└── package.json
```

---

## ⚙️ How the Trust Score Engine Works
To prevent spam (e.g., one person clicking "Report" 100 times), Nirbhaya uses a deterministic math engine:
- **Reporter Diversity (35%):** Uses an anonymous local hash. More unique devices = Higher Trust.
- **Time Spread (30%):** Reports spread over hours/days are trusted more than 10 reports in 10 seconds.
- **Category Diversity (20%):** Multiple types of incidents in one area increase confidence.
- **Burst Penalty (-15%):** Massive spikes in milliseconds heavily penalize the score.

---

*Built with ❤️ for a safer tomorrow.*
