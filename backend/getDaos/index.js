require("dotenv").config()
const { Pool } = require('pg')

const dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME
};

const pool = new Pool(dbConfig)

let client;

async function query(query, value) {
    if(client === undefined) {
        await initializeDbClient()
    }
    try {
        return await client.query(query, value)
    } catch (e) {
        console.log("Error querying")
        throw e
    }
}

const initializeDbClient = async () => {
    try {
        client = await pool.connect()
    } catch (e) {
        console.log("Error initializing client")
        throw e
    }
}

const buildResponse = (statusCode, bodyJson) => {
    return {
        "statusCode": statusCode,
        "headers": {
        "Content-Type" : "application/json",
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET"
    },
        "body": JSON.stringify(bodyJson),
    }
}


exports.handler = async (event, context) => {
    try {
        console.log("Getting dao list")

        const { rows } = await query(`
            SELECT address, name, token_symbol 
            FROM daos`, [])
        const result = rows.map(row => {
            return {address: row.address, name: row.name, tokenSymbol: row.token_symbol}
        })
        return buildResponse(200, {result: result})
    } catch (err) {
        console.log(err);
        throw err;
    }
};
