export const mockData = {
  user: {
    firstName: 'John',
    fullName: 'John Doe',
    goal: 'Perdre du poids',
  },

  home: {
    calories: {
      consumed: 287,
      burned: 40,
      target: 2393,
    },
    macros: [
      { label: 'Lipides',   value: 12, target: 71,  color: '#E5B55C' },
      { label: 'Protéines', value: 24, target: 134, color: '#E57A5C' },
      { label: 'Glucides',  value: 32, target: 299, color: '#5CAEE5' },
      { label: 'Fibres',    value: 4,  target: 38,  color: '#A3E55C' },
    ],
    meals: [
      { id: 'breakfast', label: 'Petit déj', emoji: '🥐', consumed: 287, target: 717 },
      { id: 'lunch',     label: 'Déjeuner',  emoji: '🥗', consumed: 0,   target: 717 },
      { id: 'dinner',    label: 'Dîner',     emoji: '🍽️', consumed: 0,   target: 717 },
      { id: 'snack',     label: 'En-cas',    emoji: '🍎', consumed: 0,   target: 239 },
    ],
    promo: {
      title: 'Jeûne Intermittent',
      subtitle: "Découvrez les bienfaits avec L'Avocat.",
      cta: 'En savoir plus',
    },
  },

  feed: {
    filters: ['Pour toi', 'Suivis', 'Populaires', '#nutrition'],
    posts: [
      {
        id: '1',
        author: 'Camille Dubois',
        initials: 'CD',
        avatarColor: '#2EC4B6',
        timeAgo: 'il y a 3h',
        body: "Super séance de yoga ce matin ! 🧘‍♀️ Je sens déjà les bienfaits sur ma posture et mon niveau de stress. Qui d'autre a intégré le yoga à sa routine matinale ?",
        imageBg: '#C8E8E2',
        imageEmoji: '🧘‍♀️',
        tags: ['#yoga', '#bienêtre', '#morningroutine'],
        likes: 124,
        comments: 28,
        liked: true,
        saved: false,
      },
      {
        id: '2',
        author: 'Dr. Martin Leblanc',
        initials: 'ML',
        avatarColor: '#5A627B',
        timeAgo: 'il y a 5h',
        body: "L'hydratation est clé pour maintenir votre énergie tout au long de la journée. Un rappel simple : visez au moins 1,5L d'eau par jour. Voici ma nouvelle gourde préférée qui m'aide à suivre ma consommation ! 💧",
        imageBg: '#C8DCF0',
        imageEmoji: '💧',
        tags: ['#nutrition', '#hydratation', '#santé'],
        likes: 342,
        comments: 56,
        liked: false,
        saved: true,
      },
      {
        id: '3',
        author: 'Sophie Laurent',
        initials: 'SL',
        avatarColor: '#9A4520',
        timeAgo: 'il y a 8h',
        body: "J'ai préparé mes repas pour toute la semaine ! 🥗 La meal prep c'est la clé pour rester sur ses objectifs nutritionnels sans stress au quotidien.",
        imageBg: '#EDE8D8',
        imageEmoji: '🥗',
        tags: ['#mealprep', '#nutrition', '#objectifs'],
        likes: 89,
        comments: 41,
        liked: false,
        saved: false,
      },
    ],
  },

  ia: {
    heroSubtitle:
      "J'ai analysé tes données de sommeil et d'activité. Voici ce que je te conseille pour optimiser ton énergie aujourd'hui.",
    recommendations: [
      {
        id: 'repas',
        tag: 'Repas',
        tagBg: '#E0F5F2',
        tagColor: '#2EC4B6',
        title: 'Salade Énergisante',
        description: 'Riche en fer et vitamines pour contrer ta légère fatigue matinale.',
        cta: 'Voir la recette',
      },
      {
        id: 'sport',
        tag: 'Sport',
        tagBg: '#DAE2FF',
        tagColor: '#5A627B',
        title: 'Marche Active 20 min',
        description:
          "Idéal pour atteindre ton objectif de pas sans forcer après l'entraînement d'hier.",
        cta: "Lancer l'activité",
      },
      {
        id: 'wellbeing',
        tag: 'Bien-être',
        tagBg: '#FFDBCE',
        tagColor: '#9A4520',
        title: 'Cohérence Cardiaque',
        description: '5 minutes pour réduire le stress détecté dans ton rythme hier soir.',
        cta: 'Commencer',
      },
    ],
  },

  profile: {
    name: 'John Doe',
    goal: 'Perdre du poids',
    startWeight: 80,
    currentWeight: 74,
    targetWeight: 70,
    weightHistory: [
      { month: 'Juil', weight: 80 },
      { month: 'Août', weight: 77 },
      { month: 'Sept', weight: 75 },
      { month: 'Oct',  weight: 74 },
    ],
  },
};

export const dashboardMock = {
  user: { firstName: 'John', lastName: 'Doe', fullName: 'John Doe', plan: 'Premium', memberSince: 'Jan. 2024' },
  recommendation: "Vous avez déjà bien démarré la journée. Pensez à compléter votre déjeuner avec une source de protéines.",
  calories: { consumed: 287, target: 2393 },
  macros: {
    protein: { value: 24, target: 134 },
    carbs:   { value: 32, target: 299 },
    fats:    { value: 12, target: 71  },
  },
  steps: 3240,
  sleep: '7h 15m',
  hydration: { value: 0.8, target: 2.2 },
  health: { bmi: 22.4, status: 'Zone saine', weight: 74, targetWeight: 70, weightProgress: 0.56 },
  journal: {
    mealsLogged: 1,
    mealsTarget: 4,
    summary: { consumed: 287, target: 2393, protein: 24, carbs: 32, fats: 12 },
    meals: {
      breakfast: {
        title: 'Petit-déjeuner', calories: 287,
        name: 'Tartine Avocat & Oeuf Poché',
        description: 'Pain complet, avocat, oeuf, graines de chia',
        macros: { protein: 18, carbs: 22, fats: 12 },
        illustration: 'breakfast',
      },
      lunch:  { title: 'Déjeuner',  calories: 0,   name: '',  description: '', macros: { protein: 0, carbs: 0, fats: 0 }, illustration: 'lunch' },
      dinner: { title: 'Dîner',     status: 'À venir' },
      snack:  { title: 'Snacks',    calories: 0,   name: "Snack",  description: '0 kcal', illustration: 'snack' },
    },
    advice: "Vous êtes à seulement 10% de vos glucides. Ajoutez des légumineuses à votre déjeuner.",
  },
  weekly: { activeDays: 2, activeGoal: 5, loggedMeals: 5, averageSleep: '7h 08' },
  weeklyProgress: {
    weightChange: -2.4,
    days: [
      { day: 'LUN', value: 75.2 }, { day: 'MAR', value: 75.0 },
      { day: 'MER', value: 74.8 }, { day: 'JEU', value: 74.9 },
      { day: 'VEN', value: 74.7 }, { day: 'SAM', value: 74.6 },
      { day: 'DIM', value: 74.0 },
    ],
    nutrition: { protein: 92, carbs: 65, fats: 48, advice: 'Augmentez légèrement vos glucides complexes avant vos séances de sport.' },
    streak: 18,
    motivation: 'La discipline est le pont entre vos objectifs et vos accomplissements.',
  },
  recos: {
    tip: 'Ajoutez des graines de chia à votre bol pour +5g de protéines.',
    hero: { title: 'Optimisez votre récupération', description: "Votre corps a besoin d'un apport accru en protéines ce matin." },
    hydration: { extra: '+250ml', description: "Buvez un grand verre d'eau maintenant pour relancer votre métabolisme." },
    protein: { current: 24, target: 134, description: 'Visez 30g supplémentaires au déjeuner.' },
    mealSuggestions: [
      { id: '1', tags: ['HIGH PROTEIN', '12 MIN'], name: 'Bol de Quinoa au Poulet', protein: 34 },
      { id: '2', tags: ['VÉGÉTARIEN', '8 MIN'],    name: 'Houmous & Légumes',       protein: 22 },
    ],
    habit: {
      title: 'Mâchez plus lentement',
      description: "Il faut 20 minutes à votre cerveau pour enregistrer la satiété.",
    },
  },
  profile: { goal: 'perte' as 'perte' | 'maintien' | 'gain', diet: ['Végétarien', 'Sans Gluten'], darkMode: false, aiNotifications: true },
};
