const fs = require('fs');
const readlineSync = require('readline-sync');
const crypto = require('crypto');

const MAX_ATTEMPTS = 10;
const BLOCK_DURATION = 60; // 60 seconds

let attempts = 0;
let blocked = false;
let nextUserId = 1; 
let usersData = [];

try {
    usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));

    const maxUserId = usersData.reduce((max, user) => (user.id > max ? user.id : max), 0);
    nextUserId = maxUserId + 1;
} catch (error) {
    console.error('Error reading users.json file or file is empty. Starting with default nextUserId.');
    // Handle the error or initialize nextUserId to a default value
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
        console.error('Invalid username format. Username must be 3-20 characters long and contain only letters and numbers.');
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            console.log('Exceeded maximum attempts. Please try again later.');
            return false;
        }
        retrySignUp();
        return { success: true, userId: userId };
    }

    let password = readlineSync.question('Enter your password: ', { hideEchoBack: true });

    if (!validatePassword(password)) {
        console.error('Invalid password format. Password must be at least 6 characters long, include at least one letter, one number, and one special character.');
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            console.log('Exceeded maximum attempts. Please try again later.');
            return false;
        }
        retrySignUp();
        return { success: true, userId: userId };
    }

    try {
        usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    } catch (error) {
        // If the file doesn't exist or is empty, usersData will remain an empty array
    }

    const hashedPassword = hashPassword(password);

    if (usersData.find(user => user.username === username)) {
        console.error('Username already exists. Please choose a different username.');
        return { success: false, userId: null };
    }

    try {
        // Check write permissions on the 'users.json' file
        fs.accessSync('users.json', fs.constants.W_OK);
        
        // Add user data to usersData
        usersData.push({ id: userId, username, password: hashedPassword });
    
        // Write user data to the 'users.json' file
        fs.writeFileSync('users.json', JSON.stringify(usersData, null, 2), 'utf8');
    
        console.log('Sign-up successful! User data saved.');
        return { success: true, userId: userId };
    } catch (err) {
        console.error('Error writing to users.json file:', err);
        return { success: false, error: 'Failed to save user data' };
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