const fs = require('fs');
const readlineSync = require('readline-sync');
const crypto = require('crypto');

const MAX_ATTEMPTS = 10;
let attempts = 0;

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
// Function to check user credentials
function checkUser(username, password) {
    try {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        const hashedPassword = hashPassword(password);

        const user = usersData.find(user => user.username === username && user.password === hashedPassword);
        return user;
    } catch (error) {
        console.error('Error reading user data or user not found.');
        return null;
    }
}

function signIn() {
    const username = readlineSync.question('Enter your username: ');
    const password = readlineSync.question('Enter your password: ', { hideEchoBack: true });

    const user = checkUser(username, password);

    if (user) {
        console.log('Sign in successful!');
        return user.id; // Return the user ID upon successful sign-in
    } else {
        attempts++;
        if (attempts < MAX_ATTEMPTS) {
            console.log('Invalid username or password. Please try again.');
            return signIn(); // Retry sign-in and return the result
        } else {
            console.log('Exceeded maximum login attempts. Please try again later.');
            return null; // Return null if maximum login attempts exceeded
        }
    }
}

// sign-in
module.exports = { signIn };

// function checkUser(username, password) {
//     const usersFilePath = 'users.json';

//     // Check file access permissions before reading the file
//     fs.access(usersFilePath, fs.constants.R_OK, (err) => {
//         if (err) {
//             console.error('No access to read users file:', err);
//             return null;
//         }

//         try {
//             const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
//             const hashedPassword = hashPassword(password);

//             const user = usersData.find(user => user.username === username && user.password === hashedPassword);
//             return user;
//         } catch (error) {
//             console.error('Error reading user data or user not found.');
//             return null;
//         }
//     });
// }