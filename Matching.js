const fs = require('fs'); // File system module for reading files
const readline = require('readline'); // Module for reading user input

// Interface to read user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//User input variables
let fitnessGoal, fitnessLevel, MedicalHistory;

function getFitnessGoal(choice) {
    switch (choice) {
        case 1:
            return 'Weight Loss';
        case 2:
            return 'Muscle Building';
        case 3:
            return 'Improve Flexibility';
        case 4:
            return 'Improve Cardiovascular Health';
        case 5:
            return 'Stress Relief';
        default:
            return 'Unknown';
    }
}

function getFitnessLevel(choice) {
    switch (choice) {
        case 1:
            return 'Beginner';
        case 2:
            return 'Intermediate';
        case 3:
            return 'Advanced';
        default:
            return 'Unknown';
    }
}

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
        default:
            return 'Unknown';
    }
}

function CheckMedicalHistory(choice) {
    return new Promise((resolve, reject) => {
        let userAge = null; // Initialize userAge variable
        let medicalHistory = { conditions: [], surgeries: [] };

        // Function to ask for the user's age
        function askForAge() {
            rl.question('Please enter your age: ', (ageAnswer) => {
                userAge = parseInt(ageAnswer);
                if (choice === 1) {
                    askForConditionOrSurgery();
                } else {
                    resolve({ age: userAge, medicalHistory: null });
                }
            });
        }

        // Function to ask for medical condition or surgery
        function askForConditionOrSurgery() {
            rl.question('Do you want to add a medical condition or a surgery?\n1. Medical Condition\n2. Surgery\n3. Done\n', (answer) => {
                const selection = parseInt(answer);
                if (selection === 1) {
                    rl.question('Select a medical condition:\n1. Uncontrolled hypertension\n2. Recent heart attack\n3. Unstable angina\n4. Severe heart failure\n5. Severe asthma\n6. Chronic obstructive pulmonary disease (COPD)\n7. Severe osteoarthritis\n8. Rheumatoid arthritis\n9. Fibromyalgia\n10. Chronic fatigue syndrome\n', (conditionAnswer) => {
                        medicalHistory.conditions.push(getMedicalCondition(parseInt(conditionAnswer)));
                        askForConditionOrSurgery();
                    });
                } else if (selection === 2) {
                    rl.question('Select a surgery:\n1. Coronary artery bypass grafting (CABG)\n2. Heart valve surgery\n3. Spinal fusion\n4. Major spinal surgeries\n5. Hip replacement\n6. Knee replacement\n7. Appendectomy\n8. Hernia repair\n9. Brain surgery\n', (surgeryAnswer) => {
                        medicalHistory.surgeries.push(getSurgery(parseInt(surgeryAnswer)));
                        askForConditionOrSurgery();
                    });
                } else if (selection === 3) {
                    resolve({ age: userAge, medicalHistory });
                } else {
                    console.log('Invalid choice. Please select 1 for Medical Condition, 2 for Surgery, or 3 for Done.');
                    askForConditionOrSurgery();
                }
            });
        }

        askForAge(); // Start by asking for the user's age
    });
}

function findSuitableWorkout(workoutCategories, goal, level, MedicalHistory, userAge) {
    let suitableWorkout = null;
    let category = null;

    // Iterate through each workout category in the workoutCategories JSON
    for (let key in workoutCategories) {
        const currentWorkout = workoutCategories[key];

        // Check if the current workout matches the user's goal, level, and has no surgeries that match the user's surgeries
        if (currentWorkout.goal === goal &&
            // Check if the fitness level is the same or higher
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
            break;
        }
    }

    // If a suitable workout is found
    if (suitableWorkout) {
         // Check if the user's age is greater than or equal to the minimum age for the workout
        if (userAge >= parseInt(suitableWorkout.minAge)) {
            const workoutDetails = workoutCategories[category];
            let result = `
                Category: ${category}
                Goal: ${workoutDetails.goal}
                Duration: ${workoutDetails.duration}
                Level: ${workoutDetails.level}
            `;

            // Check for matching medical conditions and print a message if found
            if (MedicalHistory && MedicalHistory.medicalHistory && MedicalHistory.medicalHistory.conditions) {
                const conditionMatch = MedicalHistory.medicalHistory.conditions.find(condition =>
                    workoutDetails.illness.includes(condition)
                );

                if (conditionMatch) {
                    result += `\nConsult a doctor before continuing due to your medical condition: ${conditionMatch}`;
                }
            }

            return result;
        } else {
            return 'You are not old enough for this workout category.';
        }
    }

    // If no suitable workout is found
    return 'No suitable workout found.';
}

rl.question('Select your Fitness Goal:\n1. Weight Loss\n2. Muscle Building\n3. Improve Flexibility\n4. Improve Cardiovascular Health\n5. Stress Relief\n', (answer1) => {
    fitnessGoal = getFitnessGoal(parseInt(answer1));

    rl.question('Select your Current Fitness Level:\n1. Beginner\n2. Intermediate\n3. Advanced\n', (answer2) => {
        fitnessLevel = getFitnessLevel(parseInt(answer2));

        rl.question('Do you have any medical conditions or surgeries?\n1. Yes\n2. No\n', (answer3) => {
            CheckMedicalHistory(parseInt(answer3)).then((medicalHistory) => {
                MedicalHistory = medicalHistory;
                console.log('Your medical history:');
                console.log(MedicalHistory);


                // Read the workout categories from the JSON file
                fs.readFile('WorkoutCategories.json', 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }

                    const workoutCategories = JSON.parse(data);
                    let suitableWorkout = findSuitableWorkout(workoutCategories, fitnessGoal, fitnessLevel, MedicalHistory, MedicalHistory.age);

                    console.log('Your suitable workout:');
                    console.log(suitableWorkout);

                    rl.close();
                });
            });
        });
    });
});