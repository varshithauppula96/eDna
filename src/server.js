const express = require('express')
const mountRoutes = require('./routes')
const fs = require('fs')
const https = require('https')
const app = express() // create the express app
const port = 3001 // 3000 for production, 3001 for development

// ssl credentials
var credentials = {
    // key: fs.readFileSync('/etc/pki/tls/private/star.bigelow.org.key'),
    // cert: fs.readFileSync('/etc/pki/tls/certs/star.bigelow.org.crt'),
    // ca: fs.readFileSync('/etc/pki/tls/certs/star.bigelow.org.ca-bundle'),
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
}

// mount express routes from the routes directory
mountRoutes(app)

// start https server
var httpsServer = https.createServer(credentials,app)
httpsServer.listen(port, () => console.log(`edna-app backend server listening on port ${port}!`))
