# SmarterDoc Frontend

SmarterDoc is an intelligent healthcare platform that helps patients find and book appointments with the right doctors, powered by AI-driven recommendations and a seamless user experience.

This repository contains the frontend built with Next.js, integrated with a FastAPI backend and deployed on Google Cloud Run.

---

## Live Deployment

**Frontend (GCP Cloud Run):**
[https://smarterdoc-frontend-1094971678787.us-central1.run.app/](https://smarterdoc-frontend-1094971678787.us-central1.run.app/)

**Backend Repository:**
[SmarterDoc Backend](https://github.com/SmarterDoc-AI-Accelerate-2025/smarterdoc-backend)

---

## Project Overview

The SmarterDoc frontend provides:

* A multi-step doctor search and appointment booking system
* AI-recommended specialists powered by backend models
* Integrated Google Maps for location-based visualization
* A clean and modern responsive UI built with Tailwind CSS and Next.js 14

**Core Pages:**

* `/` — Homepage with search and filtering
* `/doctor` — Doctor list with AI recommendations and maps
* `/doctor-detail` — Individual doctor profile and details
* `/appointment` — Appointment scheduling and confirmation

### Frontend System Flow

The diagram below illustrates the full data and user interaction flow across the frontend, backend, and AI layers.

![Frontend System Flow](/Users/hoganlin/SmarterDoc-Ai-Accelerate-2025/smarterdoc-frontend/frontend_flow.png)


---

## Tech Stack

| Category        | Technology                   |
| --------------- | ---------------------------- |
| Framework       | Next.js 14                   |
| Styling         | Tailwind CSS                 |
| Language        | TypeScript                   |
| API Integration | REST (FastAPI backend)       |
| Hosting         | Google Cloud Run             |
| Version Control | Git + GitHub Actions (CI/CD) |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SmarterDoc-AI-Accelerate-2025/smarterdoc-frontend.git
cd smarterdoc-frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Start local development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the local build.

---

## Environment Variables

Create a `.env.local` file at the root of the project and configure the following:

```bash
NEXT_PUBLIC_API_URL=https://smarterdoc-backend-1094971678787.us-central1.run.app
```

When running locally, the app automatically switches to mock data if no backend is available.

---

## Key Features

* AI Doctor Recommendations: Personalized suggestions based on specialty, location, and insurance
* Real-time Search: Filters for specialties, insurance plans, and locations
* Interactive Map: Displays doctor locations dynamically
* Appointment Flow: From doctor selection to booking confirmation
* Responsive UI: Fully optimized for both desktop and mobile

---

## Development Notes

* Local mock data is stored in `/data/` (`mockDoctors.json`, `mockSpeciality.json`, `mockInsurance.json`)
* All major UI components (Header, Map, Popups) are reusable and found in `/components/`
* State synchronization with localStorage ensures cross-page persistence for selected doctors

---

## Deployment on Google Cloud Run

1. Build the app:

   ```bash
   npm run build
   ```
2. Start the production server locally:

   ```bash
   npm start
   ```
3. Deploy using Google Cloud CLI:

   ```bash
   gcloud run deploy smarterdoc-frontend \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
   ```

---


## Additional Resources

* [Next.js Documentation](https://nextjs.org/docs)
* [Tailwind CSS Guide](https://tailwindcss.com/docs)
* [Google Cloud Run Docs](https://cloud.google.com/run/docs)
* [Remix Icon Library](https://remixicon.com/)

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---
