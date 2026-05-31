**Backend Overview**
- **Purpose:**: Node + Express API for the Expense Tracker app (MongoDB via Mongoose). Provides auth (JWT + httpOnly refresh cookies), expense CRUD, and insights generation/caching.
- **Stack:**: `node` (ESM), `express`, `mongoose`, `jsonwebtoken`, `envalid`, `vestauth` (agent auth)

**Quick Start**
- **Copy example env:**: Copy [Backend/.env.example](Backend/.env.example) to `Backend/.env` and fill real secrets.
- **Install deps:**:
```bash
cd Backend
npm install
```
- **Start (dev):**:
```bash
npm run dev
# or
npm run start
```

**Environment variables**
- **Required:** copy from [Backend/.env.example](Backend/.env.example) and set values for:
  - `MONGO_URI` — MongoDB connection string
  - `JWT_SECRET` — access token secret (min 32 chars)
  - `JWT_REFRESH_SECRET` — refresh token secret
  - `CLIENT_URL` — frontend origin for CORS (e.g. `http://localhost:5173`)
  - `PORT` — server port (default 5000)
- **Vestauth (agent) variables:** See the bottom of [Backend/.env.example](Backend/.env.example). You normally do NOT set `TOOL_*` manually — run the init step below to create them.

**Vestauth (agent) integration & initialization**
- **What it does:**: We use `vestauth` to verify cryptographically-signed agent requests. The app exposes an agent-only endpoint and helper routes to inspect the agent identity.
- **Files to know:**: [Backend/server.js](Backend/server.js), [Backend/middleware/vestAuthMiddleware.js](Backend/middleware/vestAuthMiddleware.js), [Backend/routes/insights.js](Backend/routes/insights.js)
- **Init (register this service as a vestauth tool):**
  1. Ensure `Backend/.env` exists and contains required values (see above).
 2. Run the server once with the init flag set. Examples:

PowerShell
```powershell
$env:VESTAUTH_INIT = 'true'
node server.js
```

cmd.exe
```cmd
set VESTAUTH_INIT=true && node server.js
```

bash / macOS / Linux
```bash
VESTAUTH_INIT=true node server.js
```

- **What to expect:** on success the init routine writes `TOOL_UID`, `TOOL_PUBLIC_JWK` and `TOOL_PRIVATE_JWK` into `Backend/.env` (see console output). Immediately set `VESTAUTH_INIT=false` and restart normally.
- **Security:** treat `TOOL_PRIVATE_JWK` like any secret. Add `Backend/.env` to `.gitignore` and do not commit private keys.

**Important endpoints**
- **Authentication:**
  - `POST /api/auth/register` — create account (returns access token + refresh cookie)
  - `POST /api/auth/login` — login (returns access token + refresh cookie)
  - `POST /api/auth/refresh` — exchange refresh cookie for new access token
- **Expenses:**
  - `POST /api/expenses/add` — add expense (protected by `authMiddleware`)
  - `GET /api/expenses/read` — list expenses
  - `PUT /api/expenses/update/:expenseId` — update expense
  - `DELETE /api/expenses/delete/:expenseId` — delete expense
- **Insights:**
  - `GET /api/insights` — fetch cached insight for current month (protected)
  - `POST /api/insights/generate` — regenerate insights for authenticated user (protected, cooldown)
  - `POST /api/insights/generate/agent` — regenerate insights via signed agent request (protected by `vestAuthMiddleware`)
  - `GET /whoami` — diagnostic route that returns verified agent identity when request is signed

**Middleware and auth**
- `authMiddleware` (`Backend/middleware/authMiddleware.js`): verifies Bearer JWT (`JWT_SECRET`) and attaches `req.user`.
- `vestAuthMiddleware` (`Backend/middleware/vestAuthMiddleware.js`): verifies Vest-auth signed requests and attaches `req.vestAgent`.

**Scripts**
- `npm run start` — run `node server.js`
- `npm run dev` — run `nodemon server.js`
- Migration scripts: `npm run migrate:insights` and `npm run migrate:insights:apply`

**Operator notes & troubleshooting**
- If the server fails to start due to missing env vars, `envalid` will throw a clear error and the process will exit — fix missing vars in `Backend/.env`.
- If you get `EADDRINUSE` on start, change `PORT` or stop the process using that port.
- Vestauth init requires outbound network access to the vestauth registry (defaults to `https://api.vestauth.com`) unless you set `TOOL_HOSTNAME`.

**Next steps you may want me to do**
- Add payload validation schemas for `register`, `login`, `expense` and `insights` (I can add `vestauth`-compatible validators or simple Express validators).
- Add a `scripts/vestauth_init.js` helper to register the tool programmatically and print results.

---
