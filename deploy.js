#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKEND_DIR = path.join(__dirname, 'kargho-web-backend');
const FRONTEND_DIR = path.join(__dirname, 'kargho-web-frontend');

function log(message) {
    console.log(`[DEPLOY] ${message}`);
}

function updateBackendUrl(backendUrl) {
    const indexPath = path.join(FRONTEND_DIR, 'index.html');
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Replace the placeholder URL with the actual backend URL
    content = content.replace(
        '"https://your-railway-backend-url.up.railway.app"',
        `"${backendUrl}"`
    );
    
    fs.writeFileSync(indexPath, content);
    log(`Updated backend URL in frontend to: ${backendUrl}`);
}

function deployBackend() {
    log('Deploying backend to Railway...');
    process.chdir(BACKEND_DIR);
    
    try {
        // Check if railway CLI is installed
        execSync('railway --version', { stdio: 'ignore' });
        
        // Deploy to Railway
        execSync('railway up', { stdio: 'inherit' });
        log('Backend deployed successfully to Railway!');
        
        // Get the deployment URL
        const url = execSync('railway status --json', { encoding: 'utf8' });
        const status = JSON.parse(url);
        return status.deployments[0]?.url || 'https://your-railway-backend-url.up.railway.app';
    } catch (error) {
        log('Railway CLI not found or deployment failed. Please deploy manually.');
        return 'https://your-railway-backend-url.up.railway.app';
    }
}

function deployFrontend(backendUrl) {
    log('Deploying frontend to Vercel...');
    process.chdir(FRONTEND_DIR);
    
    // Update backend URL in frontend
    updateBackendUrl(backendUrl);
    
    try {
        // Check if vercel CLI is installed
        execSync('vercel --version', { stdio: 'ignore' });
        
        // Deploy to Vercel
        execSync('vercel --prod', { stdio: 'inherit' });
        log('Frontend deployed successfully to Vercel!');
    } catch (error) {
        log('Vercel CLI not found or deployment failed. Please deploy manually.');
    }
}

function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'backend':
            deployBackend();
            break;
        case 'frontend':
            const backendUrl = args[1] || 'https://your-railway-backend-url.up.railway.app';
            deployFrontend(backendUrl);
            break;
        case 'full':
            const deployedBackendUrl = deployBackend();
            deployFrontend(deployedBackendUrl);
            break;
        default:
            log('Usage: node deploy.js [backend|frontend|full] [backend-url]');
            log('Examples:');
            log('  node deploy.js backend');
            log('  node deploy.js frontend https://your-backend.railway.app');
            log('  node deploy.js full');
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = { updateBackendUrl, deployBackend, deployFrontend };