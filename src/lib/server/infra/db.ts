import { Surreal } from "surrealdb";
import { SERVER_CONFIG } from "../../config.js";
import { surrealdbNodeEngines } from "@surrealdb/node";

const DB_CONF = SERVER_CONFIG.db;
let db: Surreal | undefined;

function dLog(message: string, data?: any) {
  console.log(`[SurrealDB] ${message}`, data);
}

/**
 * Resolve a SurrealDB connection host.
 * - If a full scheme is provided, honor it (http/https/ws/wss/surrealkv/file)
 * - Otherwise default to surrealkv://data.db at the project root
 */
function resolveHost(): string {
  const host = DB_CONF.host || "";
  if (
    host.startsWith("http://") ||
    host.startsWith("https://") ||
    host.startsWith("ws://") ||
    host.startsWith("wss://") ||
    host.startsWith("surrealkv://") ||
    host.startsWith("file://")
  ) {
    return host;
  }
  // Default to file-backed SurrealKV using project root file
  return "surrealkv://data.db";
}

async function connectDb(_db: Surreal) {
  const host = resolveHost();

  dLog("connectDb - Starting connection", {
    host,
    namespace: DB_CONF.namespace,
    database: DB_CONF.database,
    username: Boolean(DB_CONF.username) ? "<provided>" : "<none>",
  });

  try {
    dLog("connectDb - Attempting to connect to SurrealDB");
    await _db.connect(host, {
      namespace: DB_CONF.namespace,
      database: DB_CONF.database,
    });
    dLog("connectDb - Connection established");

    // Determine if engine is embedded (surrealkv/file) which does not support signin
    const isEmbedded =
      host.startsWith("surrealkv://") || host.startsWith("file://");

    // Conditional signin:
    // - Skip for embedded engines (surrealkv/file)
    // - Only attempt for network engines when credentials are provided
    if (isEmbedded) {
      dLog("connectDb - Skipping signin for embedded engine (surrealkv/file)");
    } else if (DB_CONF.username && DB_CONF.password) {
      try {
        dLog("connectDb - Performing signin with provided credentials");
        await _db.signin({
          namespace: DB_CONF.namespace,
          database: DB_CONF.database,
          username: DB_CONF.username,
          password: DB_CONF.password,
        });
        dLog("connectDb - Signin successful");
      } catch (authErr) {
        dLog("connectDb - Signin failed", {
          error: authErr instanceof Error ? authErr.message : String(authErr),
        });
        throw authErr;
      }
    } else {
      dLog("connectDb - Skipping signin (no credentials provided)");
    }

    return _db;
  } catch (error) {
    dLog("connectDb - Error occurred", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Provide clearer guidance for auth-required scenarios
    if (
      error instanceof Error &&
      /auth|unauthor/i.test(error.message) &&
      !(DB_CONF.username && DB_CONF.password)
    ) {
      throw new Error(
        `SurrealDB connection requires authentication but DB_USERNAME/DB_PASSWORD are not set. Configure credentials in .env or use a local surrealkv file database (file://). Original error: ${error.message}`
      );
    }
    throw error;
  }
}

export async function getDb(): Promise<Surreal> {
  dLog("getDb - Starting database connection process");

  if (db) {
    dLog("getDb - Existing connection found, checking status");
    try {
      await db.info();
      dLog("getDb - Existing connection is healthy");
      return db;
    } catch (error) {
      dLog("getDb - Existing connection failed, reconnecting", {
        error: error instanceof Error ? error.message : String(error),
      });
      await connectDb(db);
      dLog("getDb - Reconnection successful");
      return db;
    }
  }

  try {
    dLog("getDb - No existing connection, creating new one");
    db = new Surreal({
      engines: surrealdbNodeEngines(),
    });
    dLog("getDb - Surreal instance created, connecting...");
    await connectDb(db);
    dLog("getDb - New connection established successfully");

    return db;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    dLog("getDb - Failed to connect to SurrealDB", {
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    console.error("Failed to connect to SurrealDB:", errorMessage);
    throw err;
  }
}

export async function closeDashboardDb(): Promise<void> {
  if (!db) return;
  await db.close();
  db = undefined;
}
