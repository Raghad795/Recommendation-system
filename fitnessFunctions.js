const fs = require('fs');
const readlineSync = require('readline-sync');

// Fitness plan categories
const fitnessPlans = {
    cardio: {
        duration: 150,
        level:"Beginner",
        healthGoal: 'Weight Loss'
    },
    strengthTraining: {
        duration: 120,
        level: "Intermediate",
        healthGoal: 'Muscle Building'
    },
    flexibility: {
        duration: 90,
        level:"Beginner",
        healthGoal: 'Improve Flexibility'
    },
    hiit: {
        duration: 90,
        level:"Advanced",
        healthGoal: 'Improve Cardiovascular Health'
    },
    yoga: {
        duration: 120,
        level:"Beginner",
        healthGoal: 'Stress Relief'
    }
};


// Calculate required exercise time based on fitness level
function calculateExerciseTime(currentFitnessLevel) {
    let additionalTime = 0;

    switch (currentFitnessLevel) {
        case '0':
            additionalTime = 30; // Beginner
            break;
        case '1':
            additionalTime = 20; // Intermediate
            break;
        case '2':
            additionalTime = 10; // Advanced
            break;
        default:
            additionalTime = 0;
    }

    return additionalTime;
}

function findSuitableWorkout(workoutCategories, goal, level, MedicalHistory) {
    for (let category in workoutCategories) {
        if (
            workoutCategories[category].healthGoal === goal &&
            (
                (workoutCategories[category].level === level) ||
                (workoutCategories[category].level === 'Beginner' && (level === 'Intermediate' || level === 'Advanced')) ||
                (workoutCategories[category].level === 'Intermediate' && (level === 'Intermediate' || level === 'Advanced')) ||
                (workoutCategories[category].level === 'Advanced' && level === 'Advanced')
            ) &&
            (!MedicalHistory || MedicalHistory === 2)
        ) {
            const workoutDetails = workoutCategories[category];
            return `- Category: ${category}\n- Goal: ${workoutDetails.healthGoal}\n- Duration: ${workoutDetails.duration}\n- Level: ${workoutDetails.level}`;
        }
    }
    return 'No suitable workout found.';
}

module.exports = { fitnessPlans, calculateExerciseTime, findSuitableWorkout };