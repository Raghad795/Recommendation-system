const fs = require('fs');
const readlineSync = require('readline-sync');
const crypto = require('crypto');

//User input variables
function getMedicalCondition(choice) {
    switch (choice) {
        case 1:
            return 'Uncontrolled hypertension';
        case 2:
            return 'Recent heart attack';
        case 3:
            return 'Unstable angina';
        case 4:
            return 'Severe heart failure';
        case 5:
            return 'Severe asthma';
        case 6:
            return 'Chronic obstructive pulmonary disease (COPD)';
        case 7:
            return 'Severe osteoarthritis';
        case 8:
            return 'Rheumatoid arthritis';
        case 9:
            return 'Fibromyalgia';
        case 10:
            return 'Chronic fatigue syndrome';
        case 11:
            return 'Herniated Discs';
        case 12:
            return 'Rotator Cuff';
        case 13:
            return 'Musculoskeletal Disorder';
        case 14:
            return 'Achilles Tendon';
        case 15:
            return 'Peripheral Neuropathy';
        case 16:
            return 'Arrhythmias';
        case 17:
            return 'Seizure Disorders';
        case 18:
            return 'Peripheral Vascular Disease';
        case 19:
            return 'Epilepsy';
        case 20:
            return 'Cardiovascular Condition';
        case 21:
            return 'Obesity';
        case 22:
            return 'Multiple Sclerosis';
        case 23:
            return 'Parkinson\'s Disease';
        case 24:
            return 'Respiratory Condition';
        case 25:
            return 'Neurological Disorders';
        case 26:
            return 'Arthritis';
        default:
            return 'Unknown';
    }
}

function getSurgery(choice) {
    switch (choice) {
        case 1:
            return 'Coronary artery bypass grafting (CABG)';
        case 2:
            return 'Heart valve surgery';
        case 3:
            return 'Spinal fusion';
        case 4:
            return 'Major spinal surgeries';
        case 5:
            return 'Hip replacement';
        case 6:
            return 'Knee replacement';
        case 7:
            return 'Appendectomy';
        case 8:
            return 'Hernia repair';
        case 9:
            return 'Brain surgery';
        case 10:
            return 'Joint Replacement Surgery';
        case 11:
            return 'Shoulder Surgery';
        case 12:
            return 'Rotator Cuff Repair';
        case 13:
            return 'Tennis Elbow Repair';
        case 14:
            return 'Carpal Tunnel Release';
        case 15:
            return 'Cardiac Surgery';
        case 16:
            return 'Stent Placement';
        case 17:
            return 'Gastric Bypass Surgery';
        case 18:
            return 'Orthopedic Surgery';
        case 19:
            return 'Microdiscectomy';
        case 20:
            return 'Ligament Reconstruction Surgery';
        case 21:
            return 'ACL Reconstruction';
        case 22:
            return 'Abdominal Surgery';
        default:
            return 'Unknown';
    }
}


// Calculate required exercise time based on fitness level
function calculateExerciseTime(currentFitnessLevel) {
    let additionalTime = 0;

    switch (currentFitnessLevel) {
        case 'Beginner':
            additionalTime = 30;
            break;
        case 'Intermediate':
            additionalTime = 20;
            break;
        case 'Advanced':
            additionalTime = 10;
            break;
        default:
            additionalTime = 0;
    }

    return additionalTime;
}

function validateAge(userAge) {
    if (isNaN(userAge) || userAge < 1 || userAge > 99 || userAge % 1 !== 0) {
        return false;
    }
    return true;
}

function CheckMedicalHistory(choice) {
    let userAge = null;
    let medicalHistory = { conditions: [], surgeries: [] };

    function askForAge() {
        const ageAnswer = parseInt(readlineSync.question('Please enter your age: '));

        if (!validateAge(ageAnswer)) {
            console.log('Invalid age input.');
            return askForAge(); // Re-call the function if the age input is invalid
        }

        userAge = ageAnswer;

        if (choice === 0) {
            return askForConditionOrSurgery();
        } else {
            return { age: userAge, medicalHistory };
        }
    }

    function askForConditionOrSurgery() {
        while (true) {
            const options = ['Add Medical Condition', 'Add Surgery', 'Done'];
            const index = readlineSync.keyInSelect(options, 'Do you want to add a medical condition or a surgery?');
    
            if (index === 0) {
                const conditionOptions = [
                    'Uncontrolled hypertension', 'Recent heart attack', 'Unstable angina', 'Severe heart failure',
                    'Severe asthma', 'Chronic obstructive pulmonary disease (COPD)', 'Severe osteoarthritis',
                    'Rheumatoid arthritis', 'Fibromyalgia', 'Chronic fatigue syndrome', 'Herniated Discs',
                    'Rotator Cuff', 'Musculoskeletal Disorder', 'Achilles Tendon', 'Peripheral Neuropathy',
                    'Arrhythmias', 'Seizure Disorders', 'Peripheral Vascular Disease', 'Epilepsy', 
                    'Cardiovascular Condition', 'Obesity', 'Multiple Sclerosis', 'Parkinson\'s Disease', 
                    'Respiratory Condition', 'Neurological Disorders', 'Arthritis'
                ];
    
                console.log('Select a medical condition:');
                conditionOptions.forEach((condition, idx) => {
                    console.log(`[${idx + 1}] ${condition}`);
                });
                console.log('[0] CANCEL');
    
                let conditionAnswer;
                while (true) {
                    conditionAnswer = readlineSync.question('Enter your choice (number): ');
                    const numAnswer = parseInt(conditionAnswer, 10);
                    if (numAnswer === 0 || (numAnswer > 0 && numAnswer <= conditionOptions.length)) {
                        conditionAnswer = numAnswer; // Update to the valid number
                        break; // Valid input
                    }
                    console.log('Invalid input. Please enter a valid number from the list or 0 to cancel.');
                }
    
                if (conditionAnswer > 0) {
                    medicalHistory.conditions.push(getMedicalCondition(conditionAnswer));
                }
    
            } else if (index === 1) {
                const surgeryOptions = [
                    'Coronary artery bypass grafting (CABG)', 'Heart valve surgery', 'Spinal fusion', 
                    'Major spinal surgeries', 'Hip replacement', 'Knee replacement', 'Appendectomy', 
                    'Hernia repair', 'Brain surgery', 'Joint Replacement Surgery', 'Shoulder Surgery', 
                    'Rotator Cuff Repair', 'Tennis Elbow Repair', 'Carpal Tunnel Release', 'Cardiac Surgery', 
                    'Stent Placement', 'Gastric Bypass Surgery', 'Orthopedic Surgery', 'Microdiscectomy', 
                    'Ligament Reconstruction Surgery', 'ACL Reconstruction', 'Abdominal Surgery'
                ];
    
                console.log('Select a surgery:');
                surgeryOptions.forEach((surgery, idx) => {
                    console.log(`[${idx + 1}] ${surgery}`);
                });
                console.log('[0] CANCEL');
    
                let surgeryAnswer;
                while (true) {
                    surgeryAnswer = readlineSync.question('Enter your choice (number): ');
                    const numAnswer = parseInt(surgeryAnswer, 10);
                    if (numAnswer === 0 || (numAnswer > 0 && numAnswer <= surgeryOptions.length)) {
                        surgeryAnswer = numAnswer; // Update to the valid number
                        break; // Valid input
                    }
                    console.log('Invalid input. Please enter a valid number from the list or 0 to cancel.');
                }
    
                if (surgeryAnswer > 0) {
                    medicalHistory.surgeries.push(getSurgery(surgeryAnswer));
                }
    
            } else if (index === -1 || index === 2) {
                return { age: userAge, medicalHistory };
            } else {
                console.log('Invalid choice. Please select an option.');
            }
        }
    }
    


    return askForAge();
}

function findSuitableWorkout(workoutCategories, goal, level, exerciseTime, MedicalHistory, userAge) {
    let suitableWorkout = null;
    let category = null;
    let totalExerciseTime = 0;

    // Iterate through each workout category in the workoutCategories JSON
    for (let key in workoutCategories) {
        const currentWorkout = workoutCategories[key];

        // Check if the current workout matches the user's criteria
        if (currentWorkout.goal === goal &&
            // Check if the fitness level is suitable
            (currentWorkout.level === level ||
            (currentWorkout.level === 'Beginner' && (level === 'Intermediate' || level === 'Advanced')) ||
            (currentWorkout.level === 'Intermediate' && level === 'Advanced') ||
            (currentWorkout.level === 'Advanced' && level === 'Advanced')) &&
            (!MedicalHistory || !MedicalHistory.medicalHistory ||
                !MedicalHistory.medicalHistory.surgeries ||
                !MedicalHistory.medicalHistory.surgeries.some(surgery => currentWorkout.surgeries.includes(surgery)))
        ) {
            suitableWorkout = currentWorkout;
            category = key;
            // Add the current workout's duration to the total exercise time
            totalExerciseTime =exerciseTime + parseInt(currentWorkout.duration);
            break;
        }
    }

    // If a suitable workout is found
    if (suitableWorkout) {
        // Check if the user's age is suitable for the workout
        if (userAge >= parseInt(suitableWorkout.minAge)) {
            const workoutDetails = workoutCategories[category];
            let result = `Category: ${category}\nGoal: ${workoutDetails.goal}\nDuration: ${workoutDetails.duration}\nLevel: ${workoutDetails.level}\nExercise Time: ${exerciseTime} minutes\nTotal Exercise Time: ${totalExerciseTime} minutes`;

            // Check for matching medical conditions and print a message if found
            if (MedicalHistory && MedicalHistory.medicalHistory && MedicalHistory.medicalHistory.conditions) {
                const conditionMatch = MedicalHistory.medicalHistory.conditions.find(condition =>
                    workoutDetails.illness.includes(condition)
                );

                if (conditionMatch) {
                    result += `\nConsult a doctor before continuing due to your medical condition: ${conditionMatch}`;
                }
            }

            return { success: true, result: result, totalExerciseTime: totalExerciseTime };
        } else {
            return { success: false, message: 'You are not old enough for this workout category.'};
        }
    }

    // If no suitable workout is found
    return {success: false, message: 'No suitable workout found.'};
}
// Function to save user data to a JSON file
function saveUserDataToFile(userData) {
    const filePath = 'userInfo.json';

    let users = [];

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            users = JSON.parse(data);
        } catch (err) {
            console.error('Error reading or parsing user data file:', err);
        }
    }

    // Add the new user data to the users array
    users.push(userData);

    // Write updated user data back to file
    try {
        fs.writeFileSync(filePath, JSON.stringify(users, null, 4));
        console.log('User data has been saved successfully.');
    } catch (err) {
        console.error('Error writing user data to file:', err);
    }
}

// Function to get user data by userId
function getUserDataById(userId) {
    const filePath = 'userInfo.json';

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const users = JSON.parse(data);

        // Find the user with the matching userId
        const userData = users.find(user => user.userId === userId);

        return userData;
    } catch (err) {
        console.error('Error reading or parsing user data file:', err);
        return null;
    }
}

function formatUserData(userData) {

    return `Fitness Goal: ${userData.fitnessGoal}\n` +
           `Duration: ${userData.duration}\n` +
           `Fitness Level: ${userData.fitnessLevel}\n` +
           `Medical History:\n` +
           `  Age: ${userData.medicalHistory.age}\n` +
           `  Conditions: ${userData.medicalHistory.medicalHistory.conditions.join(', ')}\n` +
           `  Surgeries: ${userData.medicalHistory.medicalHistory.surgeries.join(', ')}`;
}

function encryptMedicalHistory(medicalHistory) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32); // Generate a secure random key
    const iv = crypto.randomBytes(16); // Generate a secure random IV

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedMedicalHistory = cipher.update(JSON.stringify(medicalHistory), 'utf8', 'hex');
    encryptedMedicalHistory += cipher.final('hex');

    return {
        key: key.toString('hex'),
        iv: iv.toString('hex'),
        content: encryptedMedicalHistory
    };
}

function decryptMedicalHistory(encryptedMedicalHistory, key, iv) {
    const algorithm = 'aes-256-cbc';
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decryptedMedicalHistory = decipher.update(encryptedMedicalHistory, 'hex', 'utf8');
    decryptedMedicalHistory += decipher.final('utf8');
    return JSON.parse(decryptedMedicalHistory);
}

module.exports = {findSuitableWorkout, calculateExerciseTime, CheckMedicalHistory, saveUserDataToFile, getUserDataById, formatUserData, encryptMedicalHistory, decryptMedicalHistory};