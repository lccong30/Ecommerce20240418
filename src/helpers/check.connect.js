const mongoose = require("mongoose");
const os = require('os')
const process = require('process')

mongoose.set("strictQuery", false);

const connectString = `mongodb://localhost:27017/shopDEV`
const _SECONDS = 5000
// Check connect
const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(connectString);
        if (conn.connection.readyState === 0) {
            console.log("DB disconnected");
        } else if (conn.connection.readyState === 1) {
            console.log("DB connected");
        } else if (conn.connection.readyState === 2) {
            console.log("DB connecting");
        } else {
            console.log("DB disconnecting");
        }
    } catch (err) {
        console.log("Connect db erorr " + err);
    }
};

// Count connections
const countConnect = () => {
    const numConnection = mongoose.connections.length
    console.log(`Number of connections: ${numConnection}`)
}

// Check over load
const checkOverLload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss
        // Example maximum number of connections base on of cores
        const maximumConn = numCores * 5

        console.log(`Active connections: ${numConnection}`)
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`)

        if (numConnection > maximumConn) {
            console.log(`Connection overload detected!!!`)
        }
    }, _SECONDS) // Monitor every 5 seconds
}

module.exports = {
    dbConnect,
    countConnect,
    checkOverLload,
}