const fs = require('fs');
const readlineSync = require('readline-sync');
const crypto = require('crypto');

const { signUp } = require('./sign_Up'); // Import signUp function from sign_Up.js
const { signIn } = require('./sign_In');

const MAX_ATTEMPTS = 10;
let attempts = 0;

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

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

function localSignIn() {
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
            return localSignIn(); // Retry sign-in and return the result
        } else {
            console.log('Exceeded maximum login attempts. Please try again later.');
            return null; // Return null if maximum login attempts exceeded
        }
    }
}

// sign-in
module.exports = { localSignIn };

//const signUp = require('./sign_Up');
// const signIn = require('./sign_In'); // Removed due to naming conflict
const fitnessFunctions = require('./fitnessFunctions');

let signUpResult = false;
let signInResult;

const signUpOrSignInOptions = ['Sign Up', 'Sign In'];
const signUpOrSignInIndex = readlineSync.keyInSelect(signUpOrSignInOptions, 'Select an option:');

if (signUpOrSignInIndex === 0) {
    signUpResult = signUp();

    if (signUpResult.success) {
        const userId = signUpResult.userId;
        const fitnessGoals = ['Weight Loss', 'Muscle Building', 'Improve Flexibility', 'Improve Cardiovascular Health', 'Stress Relief'];
        const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];

        const fitnessGoalIndex = readlineSync.keyInSelect(fitnessGoals, 'Select your fitness goal:');
        const currentFitnessLevelIndex = readlineSync.keyInSelect(fitnessLevels, 'Select your current fitness level:');

        const fitnessGoal = fitnessGoals[fitnessGoalIndex];
        const currentFitnessLevel = currentFitnessLevelIndex.toString();

        const recommendedPlans = Object.keys(fitnessFunctions.fitnessPlans).filter(plan => fitnessFunctions.fitnessPlans[plan].healthGoal === fitnessGoal);

        const requiredExerciseTime = recommendedPlans.map(plan => {
            return {
                plan: plan,
                totalDuration: fitnessFunctions.fitnessPlans[plan].duration + fitnessFunctions.calculateExerciseTime(currentFitnessLevel)
            };
        });

        const suitableWorkout = fitnessFunctions.findSuitableWorkout(fitnessFunctions.fitnessPlans, fitnessGoal, fitnessLevels[currentFitnessLevelIndex], 2);

        console.log('\nSuggested Fitness Plans:');
        recommendedPlans.forEach(plan => {
            console.log(`- ${plan} (${fitnessFunctions.fitnessPlans[plan].healthGoal})`);
        });

        console.log('\nRequired Weekly Exercise Time:');
        requiredExerciseTime.forEach(item => {
            console.log(`- ${item.plan}: ${item.totalDuration} minutes`);
        });

        console.log('\nSuitable Workout based on your inputs:');
        console.log(suitableWorkout);

        const userWorkoutPlan = {
            category: 'Fitness',
            duration: requiredExerciseTime.reduce((acc, curr) => acc + curr.totalDuration, 0),
            level: currentFitnessLevel,
            goal: fitnessGoal,
            requiredWeeklyExerciseTime: requiredExerciseTime
        };

        let usersWorkoutPlans = {};
        try {
            const data = fs.readFileSync('usersWorkoutPlans.json');
            usersWorkoutPlans = JSON.parse(data);
        } catch (error) {
            // File doesn't exist or is empty
        }

        usersWorkoutPlans[userId] = userWorkoutPlan;

        fs.writeFileSync('usersWorkoutPlans.json', JSON.stringify(usersWorkoutPlans, null, 2));
    } else {
        console.log("Sign-up failed. Please try again.");
    }
} else if (signUpOrSignInIndex === 1) {
    signInResult = localSignIn(); // Using the localSignIn function

    const userId = signInResult;
    console.log('User ID:', userId);

    if (signInResult !== null) {
        console.log('Successful sign-in.');

        const usersWorkoutPlans = JSON.parse(fs.readFileSync('usersWorkoutPlans.json'));

        if (userId in usersWorkoutPlans) {
            const userPlan = usersWorkoutPlans[userId];

            console.log('\nYour Workout Plan Information:');
            console.log(`Category: ${userPlan.category}`);
            console.log(`Duration: ${userPlan.duration} minutes`);
            console.log(`Level: ${userPlan.level}`);
            console.log(`Goal: ${userPlan.goal}`);

            console.log('\nRequired Weekly Exercise Time:');
            userPlan.requiredWeeklyExerciseTime.forEach(item => {
                console.log(`- ${item.plan}: ${item.totalDuration} minutes`);
            });
        } else {
            console.log('User ID not found in workout plans.');
        }
    } else {
        console.log('Failed to sign in.');
    }
} else {
    console.log("Exiting program.");
}