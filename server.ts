import express from "express";
import path from "path";
import { exec, execSync } from "child_process";
import { request as httpRequest } from "http";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const PYTHON_PORT = 8000;

// Try installing required FastAPI and Pydantic libraries at start
try {
  console.log("Checking and installing Python dependencies...");
  // We check python availability and make sure standard dependencies are present
  execSync("python3 -m pip install fastapi uvicorn pydantic python-multipart", { stdio: "inherit" });
  console.log("Python dependencies verified successfully.");
} catch (err) {
  console.warn("Warning: Failed to run standard pip installation. The server will attempt to run with existing modules.", err);
}

// Spawn the Python FastAPI process
console.log(`Starting Python backend on port ${PYTHON_PORT}...`);
const pythonProcess = exec(`python3 -m uvicorn app.main:app --host 127.0.0.1 --port ${PYTHON_PORT}`);

pythonProcess.stdout?.on("data", (data) => {
  console.log(`[Python] ${data.toString().trim()}`);
});

pythonProcess.stderr?.on("data", (data) => {
  console.error(`[Python Log] ${data.toString().trim()}`);
});

// Proxy HTTP Requests matching /api/* directly to python FastAPI
app.all("/api/*", (req, res) => {
  const options = {
    host: "127.0.0.1",
    port: PYTHON_PORT,
    path: req.originalUrl || req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${PYTHON_PORT}`
    }
  };

  const proxyReq = httpRequest(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy Connection Error:", err.message);
    res.status(502).json({
      error: "FastAPI server is still starting or unreachable. Please refresh in a moment."
    });
  });

  req.pipe(proxyReq);
});

// Configure Vite or Static Web Server assets middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MatchMind AI Bridge running on http://0.0.0.0:${PORT}`);
  });
}

// Clean termination hook to shut down Python child process
process.on("exit", () => {
  pythonProcess.kill();
});
process.on("SIGINT", () => {
  pythonProcess.kill();
  process.exit();
});

start();
