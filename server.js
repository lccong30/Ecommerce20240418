const app = require("./src/app");

const PORT = process.env.PORT || 3056

const server = app.listen(3055, () => {
    console.log(`eCommerce start with port ${PORT}`)
})

process.on('SIGINT', () => {
    server.close(() => console.log('Exit Server Express'))
})