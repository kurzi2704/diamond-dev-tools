// DMD_DB_GRAFANA

import { sql } from "@databases/pg";
import { getDBConnection } from "./database";

async function run() {

    const pw = process.env["DMD_DB_GRAFANA"];

    if (pw && pw.length == 0) { 
        console.log("Environment variable DMD_DB_GRAFANA is not set.");
        return;
    }

    let dbConnection = getDBConnection();
    
    await dbConnection.query(sql`CREATE USER grafanareader WITH PASSWORD '$pw';`);


}

 run();