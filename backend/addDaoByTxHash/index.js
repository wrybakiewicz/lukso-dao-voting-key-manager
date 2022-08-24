require("dotenv").config()
const { Pool } = require('pg')
const {ethers, ContractFactory} = require("ethers");
const LSP7DigitalAsset = require("@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json");
const {ERC725YKeys} = require("@lukso/lsp-smart-contracts/constants");
const {toUtf8String} = require("@ethersproject/strings");

const contractJson = require("./contracts/DaoVotingManager.json")

const CONTRACT_CREATED_METHOD_ID = "0x01c42bd7"

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

const getContractAddress = (transactionLogs) => {
    const contractCreatedLog = transactionLogs.filter(log => log.topics[0].startsWith(CONTRACT_CREATED_METHOD_ID))[0]
    const contractAddressAsBytes = contractCreatedLog.topics[2]
    return "0x" + contractAddressAsBytes.slice(-40)
}

const getDaoContractAddressWithDetails = async (txHash) => {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.l16.lukso.network");
    const transaction = await provider.getTransactionReceipt(txHash)
    const transactionData = await provider.getTransaction(txHash)
    checkBytecode(transactionData.data)
    const contractAddress = getContractAddress(transaction.logs).toLowerCase()
    const contract = ContractFactory.getContract(contractAddress, contractJson.abi, provider)
    const name = await contract.daoName()
    const governanceTokenAddress = await contract.daoGovernanceToken()
    const governanceTokenContract = ContractFactory.getContract(governanceTokenAddress, LSP7DigitalAsset.abi, provider)
    const tokenSymbol = toUtf8String(await governanceTokenContract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenSymbol))
    return {contractAddress: contractAddress, name: name, tokenSymbol: tokenSymbol}
}

const checkBytecode = (data) => {
    const bytecode = contractJson.bytecode.substring(2)
    if(!data.includes(bytecode)) {
        throw Error("Contract has different bytecode than DaoVotingManager contract !")
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

const wait = ms => new Promise(r => setTimeout(r, ms));

const retryOperation = (operation, arg, delay, retries) => new Promise((resolve, reject) => {
    return operation(arg)
        .then(resolve)
        .catch((reason) => {
            if (retries > 0) {
                console.log("Retrying")
                return wait(delay)
                    .then(retryOperation.bind(null, operation, arg, delay, retries - 1))
                    .then(resolve)
                    .catch(reject);
            }
            return reject(reason);
        });
});

exports.handler = async (event, context) => {
    try {
        console.log("Adding recovery contract address")
        console.log(event)
        const body = JSON.parse(event.body)
        const txHash = body.txHash
        console.log("TxHash: " + txHash)

        const {contractAddress, name, tokenSymbol} = await retryOperation(getDaoContractAddressWithDetails, txHash, 1000, 20)

        console.log(contractAddress)
        console.log(name)
        console.log(tokenSymbol)

        const { rows } = await query("SELECT address FROM daos WHERE address=$1", [contractAddress])
        if (rows.length > 0) {
            console.log("Contract address already exist")
            return buildResponse(400, {})
        }
        await query("INSERT INTO daos(address, name, token_symbol) VALUES ($1, $2, $3)", [contractAddress, name, tokenSymbol])
        return buildResponse(201, {})
    } catch (err) {
        console.log(err);
        throw err;
    }
};
