// Importing functions from other files
const readlineSync = require('readline-sync');
const fs = require('fs');
const { signUp } = require('./sign_Up');
const { signIn } = require('./sign_In'); 
const { findSuitableWorkout, CheckMedicalHistory, calculateExerciseTime, saveUserDataToFile, getUserDataById, formatUserData, hashMedicalHistory, decryptMedicalHistory } = require('./fitnessFunctions');

const fitnessGoals = [
    'Weight Loss',
    'Muscle Building',
    'Improve Flexibility',
    'Improve Cardiovascular Health',
    'Stress Relief'
];

const fitnessLevels = [
    'Beginner',
    'Intermediate',
    'Advanced'
];

const medicalConditions = [
    'Yes',
    'No'
];

// Choke point function to handle sign-up or sign-in
function authenticateUser() {
    const signUpOrSignInOptions = ['Sign Up', 'Sign In'];
    const signUpOrSignInIndex = readlineSync.keyInSelect(signUpOrSignInOptions, 'Select an option:');

    if (signUpOrSignInIndex === 0) {
        // Sign Up
        const signUpResult = signUp();
        if (signUpResult.success) {
            console.log("Sign-up successful.");
            return signUpResult.userId;
        } else {
            console.log("Sign-up failed. Please try again.");
            return null;
        }
    } else if (signUpOrSignInIndex === 1) {
        // Sign In
        const signInResult = signIn();
        if (signInResult !== null) {
            console.log("Successful sign in.");
            return signInResult;
        } else {
            console.log("Failed to sign in.");
            return null;
        }
    } else {
        console.log("Exiting program.");
        return null;
    }
}

// Main program execution function
function mainProgram() {
    const userId = authenticateUser();
    if (!userId) return; // Exit if authentication fails

    // Check if user data already exists
    const userData = getUserDataById(userId);
    if (userData) {
        console.log('User Data:\n');
        // Decrypt medical history data before formatting
        const decryptedMedicalHistory = decryptMedicalHistory(userData.medicalHistory.content, userData.medicalHistory.key, userData.medicalHistory.iv);
        userData.medicalHistory = decryptedMedicalHistory;

        console.log(formatUserData(userData));
    } else {
        userInput(userId); // Proceed to collect user input if no previous data is found
    }
}

// Function to gather user input and suggest workout plans
function userInput(userId) {
    // User input
    const fitnessGoalIndex = readlineSync.keyInSelect(fitnessGoals, 'Select your Fitness Goal:', { cancel: false });
    const fitnessGoal = fitnessGoals[fitnessGoalIndex];

    const fitnessLevelIndex = readlineSync.keyInSelect(fitnessLevels, 'Select your Current Fitness Level:', { cancel: false });
    const fitnessLevel = fitnessLevels[fitnessLevelIndex];
    const exerciseTime = calculateExerciseTime(fitnessLevel);

    const medicalConditionIndex = readlineSync.keyInSelect(medicalConditions, 'Do you have any medical conditions or surgeries?', { cancel: false });
    let MedicalHistory = {};
    if (medicalConditionIndex === 0) { 
        MedicalHistory = CheckMedicalHistory(medicalConditionIndex); 
        console.log('Your medical history:');
        console.log('Age: ' + MedicalHistory.age);
        console.log('Medical Conditions: ' + MedicalHistory.medicalHistory.conditions.join(', '));
        console.log('Surgeries: ' + MedicalHistory.medicalHistory.surgeries.join(', '));
    } else {
        MedicalHistory = CheckMedicalHistory(medicalConditionIndex);
    }

    // Read the workout categories from the JSON file
    try {
        const data = fs.readFileSync('WorkoutCategories.json', 'utf8');
        const workoutCategories = JSON.parse(data);
        let suitableWorkout = findSuitableWorkout(workoutCategories, fitnessGoal, fitnessLevel, exerciseTime, MedicalHistory, MedicalHistory.age);
        if (suitableWorkout) {
            if (suitableWorkout.success) {
                console.log('Your suitable workout:\n');
                console.log(suitableWorkout.result);

                // Prepare user data object
                const userData = {
                    userId: userId,
                    fitnessGoal: fitnessGoal,
                    duration: suitableWorkout.totalExerciseTime,
                    fitnessLevel: fitnessLevel,
                    medicalHistory: MedicalHistory
                };
                // Encrypt the medical history data before saving
                const encryptedMedicalHistory = hashMedicalHistory(MedicalHistory);
                userData.medicalHistory = encryptedMedicalHistory;

                // Save user data to file
                saveUserDataToFile(userData);



            } else {
                console.log(suitableWorkout.message);
            }
        } else {
            console.log('No suitable workout found.');
        }
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

// Start the main program
mainProgram();


    // // Check file access permissions before reading the file
    // fs.access('WorkoutCategories.json', fs.constants.R_OK, (err) => {
    //     if (err) {
    //         console.error('No access to read file:', err);
    //         return;
    //     }

    //         // Read the workout categories from the JSON file
    //         try {
    //             const data = fs.readFileSync('WorkoutCategories.json', 'utf8');
    //             const workoutCategories = JSON.parse(data);
    //             let suitableWorkout = findSuitableWorkout(workoutCategories, fitnessGoal, fitnessLevel, exerciseTime, MedicalHistory, MedicalHistory.age);
    //             if(suitableWorkout){
    //                 if (suitableWorkout.success) {
    //                     console.log('Your suitable workout:\n');
    //                     console.log(suitableWorkout.result);
                
    //                     // Prepare user data object
    //                     const userData = {
    //                         userId: userId,
    //                         fitnessGoal: fitnessGoal,
    //                         duration: suitableWorkout.totalExerciseTime,
    //                         fitnessLevel: fitnessLevel,
    //                         medicalHistory: MedicalHistory
    //                     };
    //                     // Save user data to file using the function
    //                     saveUserDataToFile(userData);
    //                 } else {
    //                     console.log(suitableWorkout.message);
    //                 }
    //             } else {
    //                 console.log('No suitable workout found.')
    //             }

    //         } catch (err) {
    //             console.error('Error reading file:', err);
    //         }
    // });
