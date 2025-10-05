# Realtime Code Editor – Local Setup Guide

A quick, copy‑paste README so anyone can run your **React + Express + Socket.IO** app **locally** on their machine.

> **Note**: This project is intended to run locally with a separate Node socket server. Cloud platforms like Vercel (static sites) do **not** run long‑lived WebSocket servers.

---

## Prerequisites

* **Node.js** ≥ 18 (recommend LTS)
* **npm** (bundled with Node) or **Yarn**
* **Git**

Check your versions:

```bash
node -v
npm -v
# or
yarn -v
```

---

## 1) Clone the repo & install dependencies

```bash
# clone
git clone <YOUR_REPO_URL>.git
cd <YOUR_REPO_FOLDER>

# install deps (choose one)
npm install
# or
yarn
```

> If your install fails, delete `node_modules` and try again. Make sure you are on Node 18+.

---

## 2) Create a .env file (client uses this)

Create a file named **`.env`** in the project **root** directory with:

```env
REACT_APP_BACKEND_URL=http://localhost:6000
```

* The React app reads this at **build/start time**.
* `REACT_APP_BACKEND_URL` must point to your **local** socket server URL.

> If you later change this value, stop and re‑start the React dev server so it picks up the change.

---

## 3) Start the Socket.IO server (port 6000 by default)

There are a few common ways wired in `package.json`. Try in this order:

```bash
# hot‑reload dev server (if available)
npm run server:dev
# or plain start
npm run server
# or directly
node server.js
```

You should see a log like:

```
Socket server listening on 6000
```

> If port **6000** is busy, either kill the process (see Troubleshooting) or run with a different port:

```bash
PORT=7000 node server.js
```

…and update your `.env` to `REACT_APP_BACKEND_URL=http://localhost:7000`.

---

## 4) Start the React client (port 3000 by default)

```bash
npm start
# or
yarn start
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 5) Use the app

1. Open the site at **[http://localhost:3000](http://localhost:3000)**.
2. Enter a **Room ID** and **Username**.
3. Click **Join**.
4. Open another tab/window and join the same Room ID to see real‑time editing sync.

---

## Expected project scripts (for reference)

If some commands above are missing, add these to your `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",

    "server": "node server.js",
    "server:dev": "nodemon server.js"
  }
}
```

> If you are not using Create React App, replace `react-scripts` with your framework’s start/build commands.

---

## Socket client configuration (FYI)

Your client should initialize Socket.IO like this:

```js
import { io } from 'socket.io-client';

export const initSocket = () =>
  io(process.env.REACT_APP_BACKEND_URL, {
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ['websocket', 'polling'] // allow fallback when websockets are blocked
  });
```

---

## Optional: CORS for the server

Local dev on `localhost` usually needs no special CORS config. If you see CORS errors, enable it:

```js
// server.js
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors({ origin: ['http://localhost:3000'], methods: ['GET','POST'] }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ['http://localhost:3000'], methods: ['GET','POST'] }
});

const PORT = process.env.PORT || 6000;
server.listen(PORT, () => console.log(`Socket server listening on ${PORT}`));
```

---

## Troubleshooting

### “Socket connection failed” in the browser

* **Server not running** → Start the server (`npm run server:dev` or `node server.js`).
* **Wrong URL** → Make sure `.env` has `REACT_APP_BACKEND_URL=http://localhost:6000` **and** you restarted `npm start` after creating/changing `.env`.
* **Port conflict** → Another process is on 6000. Either kill it (below) or change the port.
* **Mixed protocols** → In local dev, use `http://` on both client and server.

### Change or free a port

* Run on a different port:

  ```bash
  PORT=7000 node server.js
  ```
* **macOS / Linux – kill a port**

  ```bash
  lsof -i :6000
  kill -9 <PID>
  ```
* **Windows – kill a port**

  ```powershell
  netstat -ano | findstr :6000
  taskkill /PID <PID> /F
  ```

### Env var didn’t apply

* CRA/React dev servers read env at start. **Stop** `npm start` and run it again after editing `.env`.

### Where to put `.env`?

* In the **project root** (same folder as your `package.json`).
* Do **not** commit secrets. Add `.env` to `.gitignore`.

---

## Project layout (typical)

```
project-root/
├─ server.js             # Express + Socket.IO server
├─ src/                  # React app source
│  ├─ components/
│  ├─ pages/
│  ├─ socket.js         # Socket client init
│  └─ ...
├─ package.json
├─ .env                  # REACT_APP_BACKEND_URL=http://localhost:6000
└─ README.md
```

> If your React code isn’t in `src/`, just keep the `.env` in the same folder as `package.json` and ensure the socket client imports that env.

---

## Notes

* This setup is **local‑only**. For production, host the UI and a **separate** long‑running Node server (Render/Railway/Fly/EC2, etc.).
* Never hard‑code `localhost` for production builds.
* Keep `.env` out of version control (`.gitignore`).

---

## License

Add your preferred license here (e.g., MIT) if you plan to open‑source.
