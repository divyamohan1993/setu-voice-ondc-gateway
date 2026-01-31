
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

// Configuration
const PORT = 4000;
const SECRET = process.env.WEBHOOK_SECRET || 'default-secret-change-me';
const SCRIPT_PATH = '/home/divyamohan1993/setu-voice-ondc-gateway/scripts/redeploy.sh';
// Note: We need to ensure the path is correct. 
// In deploy_gcp.sh, APP_DIR=~/setu-voice-ondc-gateway. 
// ~ usually expands to /home/username. 
// I'll make the script path relative or dynamic if possible, but hardcoding based on assumed path is safer for a quick script.
// Better: Use process.cwd() if started from the right place.

const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end('Method Not Allowed');
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        // Verify signature if secret is provided and signature header exists
        const signature = req.headers['x-hub-signature-256'];
        if (SECRET && signature) {
            const hmac = crypto.createHmac('sha256', SECRET);
            const digest = 'sha256=' + hmac.update(body).digest('hex');
            if (signature !== digest) {
                console.error('Invalid signature');
                res.writeHead(403);
                res.end('Forbidden');
                return;
            }
        }

        // Check if it's a push event
        const event = req.headers['x-github-event'];
        if (event === 'push') {
            console.log('Received push event. Triggering redeploy...');

            // Execute redeploy script
            // using bash explicitly
            // We assume the script is in the same directory structure relative to this file
            // OR we just run the command from the project root

            const cmd = `bash ${process.cwd()}/scripts/redeploy.sh`;
            console.log('Executing:', cmd);

            exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Exec error: ${error}`);
                    return;
                }
                console.log(`Stdout: ${stdout}`);
                console.error(`Stderr: ${stderr}`);
            });

            res.writeHead(200);
            res.end('Deploy triggered');
        } else {
            res.writeHead(200);
            res.end('Event ignored');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
});
