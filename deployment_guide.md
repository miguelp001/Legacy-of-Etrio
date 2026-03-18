# ☁️ Cloudflare Deployment Guide

To deploy **Legacy of Etrio** to Cloudflare, you will use **Cloudflare Pages** for the frontend and a Node.js-compatible host for the backend.

---

## 🏗️ Frontend: Cloudflare Pages

1.  **Build the Project**:
    In the `client` directory, run:
    ```bash
    npm run build
    ```
    This generates a `dist` folder.

2.  **Cloudflare Dashboard**:
    - Go to **Workers & Pages** > **Create application** > **Pages**.
    - Connect your Git repository (GitHub/GitLab).
    - **Build Settings**:
        - **Framework Preset**: `Vite`
        - **Build Command**: `npm run build`
        - **Output Directory**: `dist`
        - **Root Directory**: `client`

3.  **Environment Variables**:
    - Under **Settings** > **Environment Variables**, add:
        - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://api.etrio.com`).

---

## 🛠️ Backend: Node.js Hosting

The backend uses Express and shared TypeScript files. While Cloudflare Workers is an option, it requires refactoring to use the Fetch API. For a seamless transition, we recommend:

### Option A: Render / Railway / Fly.io (Easiest)
These platforms support standard Node.js applications.
1.  Create a `Dockerfile` in the root (recommended for shared library builds).
2.  Set the start command to `cd server && npm run dev` (or a proper production build).
3.  Set the `PORT` environment variable to `3001`.

### Option B: Cloudflare Workers (Advanced)
If you wish to stay within the Cloudflare ecosystem:
1.  You must port the `server/src/index.ts` to use a Workers-compatible framework like [Hono](https://hono.dev/).
2.  Use `wrangler` to deploy.
3.  Note: You will need to handle CORS for your Pages domain.

---

## 🔗 Connecting the Two

1.  **CORS**: Ensure your backend has the Pages URL allowed in the `cors()` middleware:
    ```typescript
    // server/src/index.ts
    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173'
    }));
    ```

2.  **API Requests**: Ensure the frontend uses the environment variable:
    ```typescript
    // In your components/Tavern.tsx etc:
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/api/...`);
    ```

---

## ✅ Post-Deployment Checklist
- [ ] Verify `VITE_API_URL` is set on Cloudflare Pages.
- [ ] Verify `CLIENT_URL` is set on the Backend host.
- [ ] Test a floor clear to ensure the connection between frontend and backend is stable.
