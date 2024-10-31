const fs = require('fs');
const readlineSync = require('readline-sync');
const crypto = require('crypto');

const MAX_ATTEMPTS = 10;
const BLOCK_DURATION = 60; // 60 seconds

let attempts = 0;
let blocked = false;
let nextUserId = 1000; // user Id

if (fs.existsSync('userId.txt')) {
    const data = fs.readFileSync('userId.txt', 'utf8');
    nextUserId = parseInt(data, 10);
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function validateUsername(username) {
    return /^[a-zA-Z0-9]{3,20}$/.test(username);
}

function validatePassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);
}

function retrySignUp() {
    attempts = 0;
    signUp();
}

function signUp() {
    if (blocked) {
        console.log(`Too many unsuccessful attempts. Please try again after ${BLOCK_DURATION} seconds.`);
        return false;
    }

    let username = readlineSync.question('Enter your username: ').trim();

    if (!validateUsername(username)) {
        console.error('Invalid username format. Please make sure your username meets the requirements.');
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            console.log('Exceeded maximum attempts. Please try again later.');
            return false;
        }
        retrySignUp();
        return false;
    }

    let password = readlineSync.question('Enter your password: ', { hideEchoBack: true });

    if (!validatePassword(password)) {
        console.error('Invalid password format. Please make sure your password meets the requirements.');
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            console.log('Exceeded maximum attempts. Please try again later.');
            return false;
        }
        retrySignUp();
        return false;
    }

    let usersData = [];

    try {
        usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    } catch (error) {
        // If the file doesn't exist or is empty, usersData will remain an empty array
    }

    const hashedPassword = hashPassword(password);

    if (usersData.find(user => user.username === username)) {
        console.error('Username already exists. Please choose a different one.');
        return { success: false, userId: null };
    }

    const userId = nextUserId++;

    usersData.push({ id: userId, username, password: hashedPassword });
    fs.writeFileSync('userId.txt', nextUserId.toString(), 'utf8');

    fs.writeFileSync('users.json', JSON.stringify(usersData, null, 2), 'utf8');

    console.log('Sign-up successful! User data saved.');
    return { success: true, userId: userId };
}

module.exports = {signUp};