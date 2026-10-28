# Portfolio Balance Calculator

A beginner-friendly MERN-style calculator built for an internship assessment. The React frontend sends inputs to a Node.js API. No database or wallet connection is required.

## Features

- Add/remove coins and enter quantity, price, and target allocation.
- Check that target allocation percentages add up to 100%.
- Calculate target values, estimated buy/sell value, and target coin quantities.
- Responsive interface and input validation.

## Tech stack
- React + Vite + CSS
- Node.js + Express calculation API
- MongoDB: not needed because this app does not save user data

## Run locally
1. Install Node.js (LTS) from https://nodejs.org/.
2. Open a terminal in this project folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL shown by Vite (usually http://localhost:5173).

The local Express API runs on port 5000. The frontend proxies `/api` requests to it.

## Deploy to Vercel
1. Push this project folder to its own GitHub repository.
2. Sign in at https://vercel.com/ and choose **Add New → Project**.
3. Import the repository. Keep the project root at the repository root.
4. Use the settings: Framework **Vite**, Build Command `npm run build`, Output Directory `dist`. No environment variables are needed.
5. Click **Deploy**. The `api/calculate.js` serverless function handles calculator requests on Vercel.
6. Open the deployed URL and test the calculator.

For local Vercel-like serverless testing, install the Vercel CLI with `npm i -g vercel` and run `vercel dev` in this folder. For the standard local workflow, use `npm run dev`.

## GitHub and live links
- GitHub: add your repository URL here after pushing.
- Live demo: add your Vercel URL after deployment.

## Test checklist
- Change coin name, quantity, and price; click calculate.
- Add a coin and remove a coin.
- Try blank coin name, negative quantity, and negative price; confirm validation appears.
- Check the displayed totals with a hand calculation.
