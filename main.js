// Importing functions from other files
const readlineSync = require('readline-sync');
const fs = require('fs');
const { fitnessPlans, calculateExerciseTime, findSuitableWorkout} = require('./fitnessFunctions');
const { signUp } = require('./sign_Up'); // Import signUp function from sign_Up.js
const { signIn } = require('./sign_In'); // Import signUp function from sign_Up.js

let signUpResult = false;
let signInResult;

// Add a select dropdown for sign-up or sign-in
const signUpOrSignInOptions = ['Sign Up', 'Sign In'];
const signUpOrSignInIndex = readlineSync.keyInSelect(signUpOrSignInOptions, 'Select an option:');

if (signUpOrSignInIndex === 0) {
    // Sign Up
    signUpResult = signUp();

    if (signUpResult.success) {
        const userId = signUpResult.userId;
        // User input
        const fitnessGoals = ['Weight Loss', 'Muscle Building', 'Improve Flexibility', 'Improve Cardiovascular Health', 'Stress Relief'];
        const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];

        const fitnessGoalIndex = readlineSync.keyInSelect(fitnessGoals, 'Select your fitness goal:');
        const currentFitnessLevelIndex = readlineSync.keyInSelect(fitnessLevels, 'Select your current fitness level:');

        const fitnessGoal = fitnessGoals[fitnessGoalIndex];
        const currentFitnessLevel = currentFitnessLevelIndex.toString();

        // Recommended fitness plans based on user input
        const recommendedPlans = Object.keys(fitnessPlans).filter(plan => fitnessPlans[plan].healthGoal === fitnessGoal);

        // Calculate required weekly exercise time for each recommended plan
        const requiredExerciseTime = recommendedPlans.map(plan => {
            return {
                plan: plan,
                totalDuration: fitnessPlans[plan].duration + calculateExerciseTime(currentFitnessLevel)
            };
        });

        // Find a suitable workout based on user input
        const suitableWorkout = findSuitableWorkout(fitnessPlans, fitnessGoal, fitnessLevels[currentFitnessLevelIndex], 2);

        // Display the suggested fitness plans, required weekly exercise time, and suitable workout
        console.log('\nSuggested Fitness Plans:');
        recommendedPlans.forEach(plan => {
            console.log(`- ${plan} (${fitnessPlans[plan].healthGoal})`);
        });

        console.log('\nRequired Weekly Exercise Time:');
        requiredExerciseTime.forEach(item => {
            console.log(`- ${item.plan}: ${item.totalDuration} minutes`);
        });

        console.log('\nSuitable Workout based on your inputs:');
        console.log(suitableWorkout);

    } else {
        // if sign-up failed
        console.log("Sign-up failed. Please try again.");
    }
    } else if (signUpOrSignInIndex === 1) {
        // Sign In
        signInResult = signIn();
        const userId = signInResult;
        console.log('User ID:', userId);
    
        if (signInResult !== null) {
            console.log('successful sign in.');
        } else {
            console.log('Failed to sign in.');
        }
    } else {
    console.log("Exiting program.");
    }

