// DMD_DB_GRAFANA

import { sql } from "@databases/pg";
import { DB_TABLES, getDBConnection } from "./database";

async function run() {

    const pw = process.env["DMD_DB_GRAFANA"];

    if (pw && pw.length == 0) {
        console.log("Environment variable DMD_DB_GRAFANA is not set.");
        return;
    }

    // console.log('pw:', pw);

    let dbConnection = getDBConnection();

    let user = "grafanareader";
    // create user grafanareader.
    console.log('creating user grafanareader...');

    await dbConnection.query(sql`CREATE USER grafanareader WITH PASSWORD '';`);

    // let grant = async (table: string) => {
    //     await dbConnection.query(sql`GRANT SELECT ON $table TO grafanareader;`);
    // }
    console.log('granting permissions...');

    for (let table of DB_TABLES) {
        console.log('granting permissions for table:', table);
        await dbConnection.query(sql`GRANT SELECT ON ${sql.ident(table)} TO ${sql.ident(user)};`);
    }

    // await grant("headers");
}

run();