export const mockPrograms = [
  {
    id: '1',
    name: 'Beginner Strength Training',
    description: 'A simple strength training program for beginners.',
    duration: '4 weeks',
    level: 'Beginner',
    exercises: [
      { id: '1', name: 'Push Up', sets: 3, reps: 10 },
      { id: '2', name: 'Squat', sets: 3, reps: 15 },
      { id: '3', name: 'Plank', duration: '30 seconds' },
    ],
  },
  {
    id: '2',
    name: 'Intermediate Cardio Program',
    description: 'An intermediate program focusing on cardio exercises.',
    duration: '6 weeks',
    level: 'Intermediate',
    exercises: [
      { id: '4', name: 'Running', duration: '30 minutes' },
      { id: '5', name: 'Cycling', duration: '45 minutes' },
      { id: '6', name: 'Jump Rope', sets: 5, duration: '1 minute' },
    ],
  },
  {
    id: '3',
    name: 'Advanced HIIT Training',
    description: 'A high-intensity interval training program for advanced users.',
    duration: '8 weeks',
    level: 'Advanced',
    exercises: [
      { id: '7', name: 'Burpees', sets: 4, reps: 12 },
      { id: '8', name: 'Mountain Climbers', sets: 4, duration: '30 seconds' },
      { id: '9', name: 'Kettlebell Swings', sets: 4, reps: 15 },
    ],
  },
];