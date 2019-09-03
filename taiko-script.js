const { openBrowser, closeBrowser, goto, intercept, click } = require('taiko');
const fs = require('fs');
const request = require('request');
(async () => {
    try {
        const cert = fs.readFileSync('./certs/alice_cert.pem');
        const key = fs.readFileSync('./certs/alice_key.pem');
        await openBrowser({ ignoreCertificateErrors: true });
        await intercept('https://localhost:9999/authenticate', (interceptedRequest) => {
            const options = {
                uri: interceptedRequest.request.url,
                method: interceptedRequest.request.method,
                headers: interceptedRequest.request.headers,
                body: interceptedRequest.postData,
                cert: cert,
                key: key
            };
            request(options, function (err, resp, body) {
                if (err) {
                    console.error(`Unable to call ${options.uri}`, err);
                    return interceptedRequest.continue();
                }
                interceptedRequest.respond({
                    status: resp.statusCode,
                    contentType: resp.headers['content-type'],
                    headers: resp.headers,
                    body: body
                });
            });
        })
        await goto('https://localhost:9999');
        await click('Log in using client certificate');
    } catch (error) {
        console.error(error);
    } finally {
        await closeBrowser();
    }
})();
