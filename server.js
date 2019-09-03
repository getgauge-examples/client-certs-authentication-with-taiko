// This example was taken from https://medium.com/@sevcsik/authentication-using-https-client-certificates-3c9d270e8326
const fs = require('fs');
const express = require('express');
const https = require('https');
const opts = {
    key: fs.readFileSync('./certs/server_key.pem')
    , cert: fs.readFileSync('./certs/server_cert.pem')
    , requestCert: true
    , rejectUnauthorized: false
    , ca: [fs.readFileSync('./certs/server_cert.pem')]
}

const app = express()
app.get('/', (req, res) => {
    res.send('<a href="authenticate">Log in using client certificate</a>')
})

app.get('/authenticate', (req, res) => {
    const cert = req.connection.getPeerCertificate();
    if (req.client.authorized) {
        res.send(`Hello ${cert.subject.CN}, your certificate was issued by ${cert.issuer.CN}!`)
    } else if (cert.subject) {
        res.status(403)
            .send(`Sorry ${cert.subject.CN}, certificates from ${cert.issuer.CN} are not welcome here.`)
    } else {
        res.status(401)
            .send(`Sorry, but you need to provide a client certificate to continue.`)
    }
})

https.createServer(opts, app).listen(9999);

