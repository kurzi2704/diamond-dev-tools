import { sql } from "@databases/pg";
import { DB_TABLES, DbManager } from "./database";


async function run() {

    let dbManager = new DbManager();

    for (let table of DB_TABLES) {
        try {
            await dbManager.connectionPool.query(sql`DROP TABLE ${sql.ident(table)}`);
        } catch {
            // ignore error.
        }
    }
}

run();