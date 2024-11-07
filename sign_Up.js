const fs = require('fs');
const readlineSync = require('readline-sync');
const crypto = require('crypto');

const MAX_ATTEMPTS = 10;
const BLOCK_DURATION = 60 * 1000; // 60 seconds in milliseconds

let attempts = 0;
let blocked = false;
let blockStartTime = null; // to track when the blocking starts
let nextUserId = 1;
let usersData = [];

try {
    usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const maxUserId = usersData.reduce((max, user) => (user.id > max ? user.id : max), 0);
    nextUserId = maxUserId + 1;
} catch (error) {
    console.error('Error reading users.json file or file is empty. Starting with default nextUserId.');
    nextUserId = 1;
}

let userId = nextUserId;

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

// function to reset block if blocking period has expired
function retrySignUp() {
    if (blocked && Date.now() - blockStartTime >= BLOCK_DURATION) {
        attempts = 0;
        blocked = false;
    }

    if (!blocked) {
        signUp();
    } else {
        console.log(`Too many unsuccessful attempts. Please try again after ${Math.ceil((BLOCK_DURATION - (Date.now() - blockStartTime)) / 1000)} seconds.`);
    }
}

function signUp() {
    if (blocked) {
        console.log(`Too many unsuccessful attempts. Please try again after ${Math.ceil((BLOCK_DURATION - (Date.now() - blockStartTime)) / 1000)} seconds.`);
        return false;
    }

    let username = readlineSync.question('Enter your username: ').trim();
    if (!validateUsername(username)) {
        console.error('Invalid username format. Username must be 3-20 characters long and contain only letters and numbers.');
        handleFailedAttempt(); // Updated to call handleFailedAttempt on invalid attempt
        return false;
    }

    let password = readlineSync.question('Enter your password: ', { hideEchoBack: true });
    if (!validatePassword(password)) {
        console.error('Invalid password format. Password must be at least 6 characters long, include at least one letter, one number, and one special character.');
        handleFailedAttempt(); // Updated to call handleFailedAttempt on invalid attempt
        return false;
    }

    try {
        usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    } catch (error) {}

    const hashedPassword = hashPassword(password);
    if (usersData.find(user => user.username === username)) {
        console.error('Username already exists. Please choose a different username.');
        return { success: false, userId: null };
    }

    try {
        fs.accessSync('users.json', fs.constants.W_OK);
        usersData.push({ id: userId, username, password: hashedPassword });
        fs.writeFileSync('users.json', JSON.stringify(usersData, null, 2), 'utf8');
        console.log('Sign-up successful! User data saved.');
        return { success: true, userId: userId };
    } catch (err) {
        console.error('Error writing to users.json file:', err);
        return { success: false, error: 'Failed to save user data' };
    }
}

//  function to handle failed attempts and initiate blocking if maximum attempts are reached
function handleFailedAttempt() {
    attempts++;
    if (attempts >= MAX_ATTEMPTS) {
        blocked = true;
        blockStartTime = Date.now(); // Record the block start time
        console.log('Exceeded maximum attempts. Blocking for 60 seconds.');
        setTimeout(() => {
            blocked = false;
            attempts = 0;
            console.log('You can try signing up again now.');
        }, BLOCK_DURATION);
    } else {
        retrySignUp();
    }
}

module.exports = { signUp };


// try {
//     fs.accessSync('users.json', fs.constants.R_OK | fs.constants.W_OK);
//     usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
// } catch (error) {
//     // Handle file access permission error
//     console.error('Error accessing users.json file. Please check file permissions.');
//     return { success: false, userId: null };
// }