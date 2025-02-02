import {  sql } from "@databases/pg";
import { DbManager } from "./database";
import fs from "fs";

async function run() {

    let dbManager = new DbManager();

    
    let connection = dbManager.connectionPool;
   

    const scriptPath = "db/container-content";


    let files = fs.readdirSync(scriptPath).sort();

    for(const file of files) {

        console.log("executing file", file);

        const script = fs.readFileSync(`${scriptPath}/${file}`, 'utf-8');
        
        console.log("executing script", script);

        // execute the script against the connection.
        await connection.query(sql`${script}`);
    
    }

    
    // we need to send a script to this connection to create the tables.
    // the script is already available as file.


}

run();