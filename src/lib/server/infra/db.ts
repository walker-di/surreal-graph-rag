import { Surreal } from "surrealdb";
import { SERVER_CONFIG } from "../../config.js";
import { surrealdbNodeEngines } from '@surrealdb/node';

const DB_CONF = SERVER_CONFIG.db;
let db: Surreal | undefined;

function dLog(message: string, data?: any) {
	console.log(`[SurrealDB] ${message}`, data);
}

async function connectDb(_db: Surreal) {
	dLog("connectDb - Starting connection", {
		host: DB_CONF.host,
		namespace: DB_CONF.namespace,
		database: DB_CONF.database,
		username: DB_CONF.username,
	});

	try {
		dLog("connectDb - Attempting to connect to SurrealDB");
		// await _db.connect(DB_CONF.host);
		await _db.connect(DB_CONF.host, {
			namespace: DB_CONF.namespace,
			database: DB_CONF.database,
		});
		dLog("connectDb - Connection established, attempting signin");

		// await _db.signin({
		// 	namespace: DB_CONF.namespace,
		// 	database: DB_CONF.database,
		// 	username: DB_CONF.username,
		// 	password: DB_CONF.password,
		// });
		dLog("connectDb - Signin successful");

		return _db;
	} catch (error) {
		dLog("connectDb - Error occurred", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
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
