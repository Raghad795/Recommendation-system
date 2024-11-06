// Importing functions from other files
const readlineSync = require('readline-sync');
const fs = require('fs');
const { signUp } = require('./sign_Up');
const { signIn } = require('./sign_In'); 
const {findSuitableWorkout, CheckMedicalHistory, calculateExerciseTime, saveUserDataToFile, getUserDataById, formatUserData, hashMedicalHistory} = require('./fitnessFunctions');

let Result;


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

// Add a select dropdown for sign-up or sign-in
const signUpOrSignInOptions = ['Sign Up', 'Sign In'];
const signUpOrSignInIndex = readlineSync.keyInSelect(signUpOrSignInOptions, 'Select an option:');

if (signUpOrSignInIndex === 0) {
    // Sign Up
    Result = signUp();

    if (Result.success) {
        const userId = Result.userId;
        userInput(userId);

    } else {
        // if sign-up failed
        console.log("Sign-up failed. Please try again.");
    }
} else if (signUpOrSignInIndex === 1) {
    // Sign In
    Result = signIn();
    const userId = Result;
    console.log('User ID:', userId);

    if (Result !== null) {
        console.log('Successful sign in.');

        // Get user data by userId
        const userData = getUserDataById(userId);

        if (userData) {
            console.log('User Data:\n');
            console.log(formatUserData(userData));
        } else {
            userInput(userId);
        }
    } else {
        console.log('Failed to sign in.');
    }
} else {
console.log("Exiting program.");
}




function userInput(userId){
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
        }else{
            MedicalHistory = CheckMedicalHistory(medicalConditionIndex);
        }

        // Read the workout categories from the JSON file
        try {
            const data = fs.readFileSync('WorkoutCategories.json', 'utf8');
            const workoutCategories = JSON.parse(data);
            let suitableWorkout = findSuitableWorkout(workoutCategories, fitnessGoal, fitnessLevel, exerciseTime, MedicalHistory, MedicalHistory.age);
            if(suitableWorkout){
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
                    // Save user data to file using the function
                    saveUserDataToFile(userData);
                } else {
                    console.log(suitableWorkout.message);
                }
            }else{
                console.log('No suitable workout found.')
            }

        } catch (err) {
            console.error('Error reading file:', err);
        }
}

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
