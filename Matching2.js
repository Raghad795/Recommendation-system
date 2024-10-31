const fs = require('fs'); // File system module for reading files
const readline = require('readline'); // Module for reading user input

// Interface to read user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// User input variables
let fitnessGoal, fitnessLevel, medicalConditions = [], surgeries = [], hasMedicalHistory = false;

// Utility functions to map user choices
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

// Function to collect conditions or surgeries based on user choice
function collectMedicalHistory() {
    return new Promise((resolve) => {
        rl.question('Would you like to add a Condition or a Surgery? Type "Done" when finished.\n1. Condition\n2. Surgery\n3. Done\n', (choice) => {
            if (choice === '1') {
                rl.question('Enter a medical condition: ', (condition) => {
                    medicalConditions.push(condition.trim().toLowerCase());
                    collectMedicalHistory().then(resolve); // Ask again for more conditions or surgeries
                });
            } else if (choice === '2') {
                rl.question('Enter a surgery: ', (surgery) => {
                    surgeries.push(surgery.trim().toLowerCase());
                    collectMedicalHistory().then(resolve); // Ask again for more conditions or surgeries
                });
            } else if (choice === '3') {
                resolve(); // Finish collecting medical history
            } else {
                console.log('Invalid choice. Please select 1, 2, or 3.');
                collectMedicalHistory().then(resolve);
            }
        });
    });
}

// Function to display user information in a box format
function displayUserInfo() {
    console.log('========================================');
    console.log('             User Information           ');
    console.log('========================================');
    console.log(`Fitness Goal: ${fitnessGoal}`);
    console.log(`Fitness Level: ${fitnessLevel}`);
    
    if (hasMedicalHistory) {
        console.log('Medical History:');
        console.log(`Conditions: ${medicalConditions.length > 0 ? medicalConditions.join(', ') : 'None'}`);
        console.log(`Surgeries: ${surgeries.length > 0 ? surgeries.join(', ') : 'None'}`);
    } else {
        console.log('No medical history provided.');
    }
    
    console.log('========================================\n');
}

// Function to check each workout and filter out unsuitable ones
function findSuitableWorkouts(workoutCategories, goal, level, hasHistory, medicalConditions, surgeries) {
    const suitableWorkouts = [];
    const notRecommendedWorkouts = new Map(); // Use a Map to avoid duplicates

    for (const [category, workout] of Object.entries(workoutCategories)) {
        // Check fitness goal and level compatibility
        const goalMatch = workout.goal === goal;
        const levelMatch = workout.level === level ||
            (workout.level === 'Beginner' && (level === 'Intermediate' || level === 'Advanced')) ||
            (workout.level === 'Intermediate' && level === 'Advanced');

        // Skip medical checks if user has no medical history
        const conditionConflict = hasHistory ? workout.diseases.some(disease => medicalConditions.includes(disease.toLowerCase())) : false;
        const surgeryConflict = hasHistory ? workout.surgeries.some(surgery => surgeries.includes(surgery.toLowerCase())) : false;

        if (goalMatch && levelMatch) {
            // If there is a disease conflict, still recommend but with a warning
            if (conditionConflict) {
                suitableWorkouts.push({
                    category,
                    details: workout,
                    warning: `Medical consultation recommended due to the following condition: ${medicalConditions.join(', ')}. Please proceed with caution.`
                });
            } else if (!surgeryConflict) {
                suitableWorkouts.push({
                    category,
                    details: workout
                });
            }
        } else {
            // Create a unique key for the workout category
            const reasons = [];
            if (!goalMatch) reasons.push(`The Goal of this workout is ${goal}, but you want to focus on ${workout.goal}`);
            if (!levelMatch) reasons.push(`The Level of this workout is ${level}, but your level is ${workout.level}`);
            if (conditionConflict) reasons.push(`Conflicting medical condition(s)`);
            if (surgeryConflict) reasons.push(`Conflicting surgery history`);

            // Check for duplicate categories in notRecommendedWorkouts
            if (!notRecommendedWorkouts.has(category)) {
                notRecommendedWorkouts.set(category, {
                    details: workout,
                    reasons
                });
            } else {
                notRecommendedWorkouts.get(category).reasons.push(...reasons);
            }
        }
    }

    return {
        suitableWorkouts,
        notRecommendedWorkouts: Array.from(notRecommendedWorkouts.entries()).map(([category, workout]) => ({
            category,
            details: workout.details,
            reasons: workout.reasons
        }))
    };
}

// Main Program Execution
rl.question('Select your Fitness Goal:\n1. Weight Loss\n2. Muscle Building\n3. Improve Flexibility\n4. Improve Cardiovascular Health\n5. Stress Relief\n', (answer1) => {
    fitnessGoal = getFitnessGoal(parseInt(answer1));

    rl.question('Select your Current Fitness Level:\n1. Beginner\n2. Intermediate\n3. Advanced\n', (answer2) => {
        fitnessLevel = getFitnessLevel(parseInt(answer2));

        rl.question('Do you have any medical history (conditions or surgeries)?\n1. Yes\n2. No\n', (answer3) => {
            if (parseInt(answer3) === 1) {
                hasMedicalHistory = true;

                // Collect medical history (conditions and surgeries)
                collectMedicalHistory().then(() => {
                    fs.readFile('WorkoutCategories.json', 'utf8', (err, data) => {
                        if (err) {
                            console.error('Error reading file:', err);
                            return;
                        }

                        const workoutCategories = JSON.parse(data);
                        displayUserInfo(); // Display user info before recommendations
                        const { suitableWorkouts, notRecommendedWorkouts } = findSuitableWorkouts(
                            workoutCategories,
                            fitnessGoal,
                            fitnessLevel,
                            hasMedicalHistory,
                            medicalConditions,
                            surgeries
                        );

                        // Check if there are any suitable workouts
                        if (suitableWorkouts.length > 0) {
                            console.log('Recommended Workouts:');
                            suitableWorkouts.forEach(workout => {
                                console.log(`Category: ${workout.category}\nGoal: ${workout.details.goal}\nDuration: ${workout.details.duration}\nLevel: ${workout.details.level}${workout.warning ? `\n${workout.warning}` : ''}\n`);
                            });
                        } else {
                            console.log('Unfortunately, no workout is recommended for you.\n');
                        }

                        console.log('Workouts Not Recommended and Reasons:');
                        if (notRecommendedWorkouts.length > 0) {
                            notRecommendedWorkouts.forEach(workout => {
                                console.log(`Category: ${workout.category}\nReasons: ${workout.reasons.join(', ')}\n`);
                            });
                        } else {
                            console.log('No workouts were found to be unsuitable for your conditions.\n');
                        }

                        rl.close();
                    });
                });
            } else {
                // No medical history
                fs.readFile('WorkoutCategories.json', 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }

                    const workoutCategories = JSON.parse(data);
                    displayUserInfo(); // Display user info before recommendations
                    const { suitableWorkouts, notRecommendedWorkouts } = findSuitableWorkouts(
                        workoutCategories,
                        fitnessGoal,
                        fitnessLevel,
                        false, // No medical history to consider
                        medicalConditions,
                        surgeries
                    );

                    // Check if there are any suitable workouts
                    if (suitableWorkouts.length > 0) {
                        console.log('Recommended Workouts:');
                        suitableWorkouts.forEach(workout => {
                            console.log(`Category: ${workout.category}\nGoal: ${workout.details.goal}\nDuration: ${workout.details.duration}\nLevel: ${workout.details.level}\n`);
                        });
                    } else {
                        console.log('Unfortunately, no workout is recommended for you.\n');
                    }

                    console.log('Workouts Not Recommended and Reasons:');
                    if (notRecommendedWorkouts.length > 0) {
                        notRecommendedWorkouts.forEach(workout => {
                            console.log(`Category: ${workout.category}\nReasons: ${workout.reasons.join(', ')}\n`);
                        });
                    } else {
                        console.log('No workouts were found to be unsuitable for your conditions.\n');
                    }

                    rl.close();
                });
            }
        });
    });
});
