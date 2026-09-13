import http from 'node:http';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { URL } from 'node:url';
import { PrismaClient } from '@prisma/client';

const PORT = Number(process.env.PORT ?? 15002);

const ADMIN_SESSION_COOKIE = 'healthia_admin_session';
const ENTERPRISE_SESSION_COOKIE = 'healthia_enterprise_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

const DEFAULT_ENTERPRISE_ACCOUNTS = [
  {
    slug: 'clinique-horizon',
    name: 'Clinique Horizon',
    email: 'enterprise@clinique-horizon.healthia.local',
    password: 'Enterprise123!',
    sector: 'Santé privée',
  },
  {
    slug: 'mutuelle-avenir',
    name: 'Mutuelle Avenir',
    email: 'enterprise@mutuelle-avenir.healthia.local',
    password: 'Enterprise123!',
    sector: 'Assurance santé',
  },
  {
    slug: 'wellness-lab',
    name: 'Wellness Lab',
    email: 'enterprise@wellness-lab.healthia.local',
    password: 'Enterprise123!',
    sector: 'Corporate wellness',
  },
];

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'healthia-dev-secret-change-me';
}

function sign(payloadBase64) {
  return createHmac('sha256', getSessionSecret()).update(payloadBase64).digest('base64url');
}

function createAdminSessionToken(adminId, email) {
  const payload = {
    adminId,
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = sign(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

function verifyAdminSessionToken(token) {
  return verifySessionToken(token, ['adminId', 'email']);
}

function createEnterpriseSessionToken(enterprise) {
  const payload = {
    enterpriseId: enterprise.id,
    slug: enterprise.slug,
    email: enterprise.email,
    name: enterprise.name,
    sector: enterprise.sector,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = sign(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

function verifySessionToken(token, requiredKeys = []) {
  const [payloadBase64, signature] = String(token).split('.');
  if (!payloadBase64 || !signature) return null;

  const expectedSignature = sign(payloadBase64);
  if (signature.length !== expectedSignature.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    for (const key of requiredKeys) {
      if (!payload?.[key]) return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function verifyEnterpriseSessionToken(token) {
  return verifySessionToken(token, ['enterpriseId', 'email', 'slug']);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = String(passwordHash ?? '').split(':');
  if (!salt || !storedHash) return false;
  const computedHash = scryptSync(String(password), salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(computedHash, 'hex'));
}

function createFallbackDatabase() {
  const now = Date.now();
  const daysAgo = (days) => new Date(now - days * 86_400_000).toISOString();
  const cloneRow = (row) => JSON.parse(JSON.stringify(row));
  const sortById = (rows) => [...rows].sort((left, right) => Number(left.id) - Number(right.id));

  const store = {
    admins: [
      {
        id: 1,
        email: 'admin@healthai.local',
        passwordHash: hashPassword('Password123!'),
        createdAt: daysAgo(120),
      },
    ],
    enterprises: [],
    users: [
      {
        id: 1,
        nom: 'Alex Martin',
        age: 34,
        gender: 'male',
        poids: 78,
        taille: 178,
        disease_type: 'type2_diabetes',
        disease_severity: 'moderate',
        daily_caloric_intake: 2200,
        adherence_to_diet_plan: 0.72,
        physical_activity_level: 'moderate',
        enterprise_id: null,
        createdAt: daysAgo(12),
      },
      {
        id: 2,
        nom: 'Sophie Durand',
        age: 28,
        gender: 'female',
        poids: 62,
        taille: 165,
        disease_type: null,
        disease_severity: null,
        daily_caloric_intake: 1900,
        adherence_to_diet_plan: 0.88,
        physical_activity_level: 'high',
        enterprise_id: null,
        createdAt: daysAgo(10),
      },
      {
        id: 3,
        nom: 'Nadia Benali',
        age: 41,
        gender: 'female',
        poids: 71,
        taille: 170,
        disease_type: 'hypertension',
        disease_severity: 'mild',
        daily_caloric_intake: 2050,
        adherence_to_diet_plan: 0.76,
        physical_activity_level: 'moderate',
        enterprise_id: null,
        createdAt: daysAgo(8),
      },
      {
        id: 4,
        nom: 'Thomas Leroy',
        age: 52,
        gender: 'male',
        poids: 89,
        taille: 181,
        disease_type: 'type2_diabetes',
        disease_severity: 'moderate',
        daily_caloric_intake: 2180,
        adherence_to_diet_plan: 0.68,
        physical_activity_level: 'low',
        enterprise_id: null,
        createdAt: daysAgo(7),
      },
      {
        id: 5,
        nom: 'Camille Robert',
        age: 31,
        gender: 'female',
        poids: 63,
        taille: 168,
        disease_type: null,
        disease_severity: null,
        daily_caloric_intake: 1820,
        adherence_to_diet_plan: 0.91,
        physical_activity_level: 'high',
        enterprise_id: null,
        createdAt: daysAgo(5),
      },
      {
        id: 6,
        nom: 'Yassine Diallo',
        age: 47,
        gender: 'male',
        poids: 94,
        taille: 176,
        disease_type: 'obesity',
        disease_severity: 'severe',
        daily_caloric_intake: 2400,
        adherence_to_diet_plan: 0.54,
        physical_activity_level: 'low',
        enterprise_id: null,
        createdAt: daysAgo(4),
      },
      {
        id: 7,
        nom: 'Lea Morel',
        age: 27,
        gender: 'female',
        poids: 59,
        taille: 163,
        disease_type: null,
        disease_severity: null,
        daily_caloric_intake: 1750,
        adherence_to_diet_plan: 0.84,
        physical_activity_level: 'moderate',
        enterprise_id: null,
        createdAt: daysAgo(3),
      },
      {
        id: 8,
        nom: 'Karim Aït',
        age: 39,
        gender: 'male',
        poids: 82,
        taille: 178,
        disease_type: 'hypertension',
        disease_severity: 'moderate',
        daily_caloric_intake: 2120,
        adherence_to_diet_plan: 0.73,
        physical_activity_level: 'moderate',
        enterprise_id: null,
        createdAt: daysAgo(2),
      },
    ],
    foods: [
      { id: 1, name: 'Poulet grillé', category: 'protein', calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugars: 0, sodium: 74, cholesterol: 85 },
      { id: 2, name: 'Riz complet', category: 'carb', calories: 112, protein: 2.6, carbohydrates: 23, fat: 0.9, fiber: 1.8, sugars: 0.4, sodium: 5, cholesterol: 0 },
      { id: 3, name: 'Brocoli vapeur', category: 'vegetable', calories: 35, protein: 2.4, carbohydrates: 7, fat: 0.4, fiber: 3.3, sugars: 1.4, sodium: 41, cholesterol: 0 },
      { id: 4, name: 'Yaourt grec nature', category: 'dairy', calories: 97, protein: 9, carbohydrates: 3.6, fat: 5, fiber: 0, sugars: 3.2, sodium: 36, cholesterol: 10 },
      { id: 5, name: 'Avoine', category: 'carb', calories: 389, protein: 16.9, carbohydrates: 66.3, fat: 6.9, fiber: 10.6, sugars: 0.9, sodium: 2, cholesterol: 0 },
    ],
    exercises: [
      { id: 1, name: 'Squat', equipment: null, body_part: 'legs', exercise_type: 'strength' },
      { id: 2, name: 'Pompes', equipment: null, body_part: 'chest', exercise_type: 'strength' },
      { id: 3, name: 'Row élastique', equipment: 'band', body_part: 'back', exercise_type: 'strength' },
      { id: 4, name: 'Gainage', equipment: null, body_part: 'core', exercise_type: 'core' },
      { id: 5, name: 'Marche rapide', equipment: null, body_part: null, exercise_type: 'cardio' },
      { id: 6, name: 'Mobilité', equipment: null, body_part: 'full', exercise_type: 'mobility' },
    ],
    allergies: [
      { id: 1, name: 'Arachides' },
      { id: 2, name: 'Lait' },
    ],
    restrictions: [
      { id: 1, name: 'Faible sodium' },
      { id: 2, name: 'Faible glucides' },
    ],
    meals: [
      { id: 1, user_id: 1, meal_type: 'lunch', date: daysAgo(1), total_calories: 610, water_intake: 1.8 },
      { id: 2, user_id: 2, meal_type: 'breakfast', date: daysAgo(1), total_calories: 420, water_intake: 1.2 },
      { id: 3, user_id: 3, meal_type: 'dinner', date: daysAgo(2), total_calories: 680, water_intake: 1.5 },
      { id: 4, user_id: 4, meal_type: 'lunch', date: daysAgo(2), total_calories: 720, water_intake: 1.7 },
      { id: 5, user_id: 5, meal_type: 'breakfast', date: daysAgo(3), total_calories: 390, water_intake: 1.3 },
      { id: 6, user_id: 6, meal_type: 'dinner', date: daysAgo(3), total_calories: 760, water_intake: 1.6 },
    ],
    userExercises: [
      { id: 1, user_id: 1, exercise_id: 1, duration: 35, calories_burned: 240, date: daysAgo(1) },
      { id: 2, user_id: 2, exercise_id: 5, duration: 28, calories_burned: 180, date: daysAgo(1) },
      { id: 3, user_id: 3, exercise_id: 4, duration: 24, calories_burned: 120, date: daysAgo(2) },
      { id: 4, user_id: 4, exercise_id: 2, duration: 32, calories_burned: 220, date: daysAgo(2) },
      { id: 5, user_id: 5, exercise_id: 6, duration: 21, calories_burned: 95, date: daysAgo(3) },
      { id: 6, user_id: 6, exercise_id: 3, duration: 40, calories_burned: 260, date: daysAgo(3) },
    ],
    recommendations: [
      { id: 1, user_id: 1, type: 'nutrition', reference_id: 1, score: 0.86, reason: 'Réduire les glucides au dîner', created_at: daysAgo(1) },
      { id: 2, user_id: 2, type: 'training', reference_id: 2, score: 0.74, reason: 'Ajouter une séance cardio courte', created_at: daysAgo(2) },
      { id: 3, user_id: 3, type: 'health', reference_id: 3, score: 0.81, reason: 'Surveiller la tension artérielle', created_at: daysAgo(2) },
      { id: 4, user_id: 4, type: 'recovery', reference_id: 4, score: 0.68, reason: 'Prévoir une journée de récupération', created_at: daysAgo(3) },
      { id: 5, user_id: 5, type: 'nutrition', reference_id: 5, score: 0.9, reason: 'Renforcer l’apport en protéines', created_at: daysAgo(4) },
      { id: 6, user_id: 6, type: 'training', reference_id: 6, score: 0.77, reason: 'Fractionner les efforts en intervalles', created_at: daysAgo(5) },
    ],
    appSettings: [],
    nextIds: {
      admin: 2,
      enterprise: 1,
      user: 9,
      food: 6,
      exercise: 7,
      allergy: 3,
      restriction: 3,
      meal: 7,
      userExercise: 7,
      recommendation: 7,
    },
  };

  const getUserEnterpriseId = (userId) => {
    const user = store.users.find((item) => item.id === Number(userId));
    return user?.enterprise_id ?? null;
  };

  const matchEnterprise = (row, where = {}) => {
    if (where.id !== undefined && row.id !== Number(where.id)) return false;
    if (where.email !== undefined && row.email !== where.email) return false;
    if (where.slug !== undefined && row.slug !== where.slug) return false;
    return true;
  };

  const matchUser = (row, where = {}) => {
    if (where.id !== undefined && row.id !== Number(where.id)) return false;
    if (where.enterprise_id !== undefined && row.enterprise_id !== where.enterprise_id) return false;
    if (where.enterprise_id === null && row.enterprise_id !== null) return false;
    if (where.disease_type !== undefined && row.disease_type !== where.disease_type) return false;
    if (where.createdAt?.gte && new Date(row.createdAt).getTime() < new Date(where.createdAt.gte).getTime()) return false;
    return true;
  };

  const matchRecommendation = (row, where = {}) => {
    if (where.id !== undefined && row.id !== Number(where.id)) return false;
    if (where.user?.enterprise_id !== undefined && getUserEnterpriseId(row.user_id) !== Number(where.user.enterprise_id)) return false;
    return true;
  };

  const matchMeal = (row, where = {}) => {
    if (where.user?.enterprise_id !== undefined && getUserEnterpriseId(row.user_id) !== Number(where.user.enterprise_id)) return false;
    return true;
  };

  const matchUserExercise = (row, where = {}) => {
    if (where.user?.enterprise_id !== undefined && getUserEnterpriseId(row.user_id) !== Number(where.user.enterprise_id)) return false;
    return true;
  };

  return {
    admin: {
      count: async () => store.admins.length,
      findUnique: async ({ where }) => cloneRow(store.admins.find((row) => matchEnterprise(row, where)) ?? null),
      create: async ({ data }) => {
        const row = { id: store.nextIds.admin++, email: data.email, passwordHash: data.passwordHash, createdAt: daysAgo(0) };
        store.admins.push(row);
        return cloneRow(row);
      },
    },
    enterprise: {
      upsert: async ({ where, update, create }) => {
        const existing = store.enterprises.find((row) => row.slug === where.slug);
        if (existing) {
          Object.assign(existing, update);
          return cloneRow(existing);
        }

        const row = { id: store.nextIds.enterprise++, createdAt: daysAgo(0), ...create };
        store.enterprises.push(row);
        return cloneRow(row);
      },
      findMany: async () => cloneRow(sortById(store.enterprises)),
      findUnique: async ({ where }) => cloneRow(store.enterprises.find((row) => matchEnterprise(row, where)) ?? null),
    },
    utilisateur: {
      findMany: async ({ where } = {}) => cloneRow(sortById(store.users.filter((row) => matchUser(row, where)))),
      findUnique: async ({ where }) => cloneRow(store.users.find((row) => matchUser(row, where)) ?? null),
      findFirst: async ({ where }) => cloneRow(store.users.find((row) => matchUser(row, where)) ?? null),
      update: async ({ where, data }) => {
        const row = store.users.find((item) => item.id === Number(where.id));
        if (!row) throw new Error('Utilisateur introuvable');
        Object.assign(row, data);
        return cloneRow(row);
      },
      create: async ({ data }) => {
        const row = {
          id: store.nextIds.user++,
          nom: String(data.nom),
          age: Number(data.age),
          gender: String(data.gender),
          poids: Number(data.poids),
          taille: Number(data.taille),
          disease_type: data.disease_type ?? null,
          disease_severity: data.disease_severity ?? null,
          daily_caloric_intake: data.daily_caloric_intake ?? null,
          adherence_to_diet_plan: data.adherence_to_diet_plan ?? null,
          physical_activity_level: data.physical_activity_level ?? null,
          enterprise_id: data.enterprise_id ?? null,
          createdAt: daysAgo(0),
        };
        store.users.push(row);
        return cloneRow(row);
      },
      count: async ({ where } = {}) => {
        let rows = store.users.filter((row) => matchUser(row, where));
        if (where?.createdAt?.gte) {
          rows = rows.filter((row) => new Date(row.createdAt).getTime() >= new Date(where.createdAt.gte).getTime());
        }
        return rows.length;
      },
    },
    food: {
      findMany: async () => cloneRow(sortById(store.foods)),
    },
    exercise: {
      findMany: async () => cloneRow(sortById(store.exercises)),
    },
    allergy: {
      findMany: async () => cloneRow(sortById(store.allergies)),
    },
    dietaryRestriction: {
      findMany: async () => cloneRow(sortById(store.restrictions)),
    },
    meal: {
      findMany: async ({ where } = {}) => cloneRow([...store.meals.filter((row) => matchMeal(row, where))].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())),
    },
    userExercise: {
      findMany: async ({ where, include } = {}) => {
        const rows = store.userExercises.filter((row) => matchUserExercise(row, where));
        return cloneRow(
          [...rows].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()).map((row) => {
            const nextRow = { ...row };
            if (include?.user) {
              nextRow.user = cloneRow(store.users.find((user) => user.id === row.user_id) ?? null);
            }
            if (include?.exercise) {
              nextRow.exercise = cloneRow(store.exercises.find((exercise) => exercise.id === row.exercise_id) ?? null);
            }
            return nextRow;
          })
        );
      },
    },
    recommendation: {
      findMany: async ({ where } = {}) => cloneRow([...store.recommendations.filter((row) => matchRecommendation(row, where))].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())),
      findFirst: async ({ where } = {}) => cloneRow(store.recommendations.find((row) => matchRecommendation(row, where)) ?? null),
      findUnique: async ({ where } = {}) => cloneRow(store.recommendations.find((row) => matchRecommendation(row, where)) ?? null),
      create: async ({ data }) => {
        const row = {
          id: store.nextIds.recommendation++,
          user_id: Number(data.user_id),
          type: String(data.type),
          reference_id: Number(data.reference_id ?? 0),
          score: data.score ?? null,
          reason: data.reason ?? null,
          created_at: daysAgo(0),
        };
        store.recommendations.push(row);
        return cloneRow(row);
      },
    },
    appSetting: {
      findUnique: async ({ where }) => cloneRow(store.appSettings.find((row) => row.key === where.key) ?? null),
      upsert: async ({ where, update, create }) => {
        const existing = store.appSettings.find((row) => row.key === where.key);
        if (existing) {
          Object.assign(existing, update, { updatedAt: daysAgo(0) });
          return cloneRow(existing);
        }

        const row = { createdAt: daysAgo(0), updatedAt: daysAgo(0), ...create };
        store.appSettings.push(row);
        return cloneRow(row);
      },
    },
    $disconnect: async () => {},
  };
}

const IA_BASE_URLS = Object.freeze(
  String(process.env.IA_BASE_URL ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .concat(['http://ia:15003', 'http://127.0.0.1:15003', 'http://localhost:15003'])
    .filter((value, index, arr) => arr.indexOf(value) === index)
);

const IA_DISABLED = ['1', 'true', 'yes', 'y', 'on'].includes(
  String(process.env.HEALTHIA_DISABLE_IA ?? '').trim().toLowerCase()
);

function normalizeUserHeightMeters(value) {
  const height = Number(value);
  if (!Number.isFinite(height) || height <= 0) return null;
  // In app DB, height is commonly stored as centimeters (e.g. 178). IA expects meters (e.g. 1.78).
  if (height > 10) return height / 100;
  return height;
}

function computeBmi(weightKg, heightMeters) {
  const w = Number(weightKg);
  const h = Number(heightMeters);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return w / (h * h);
}

async function postIaJson(path, payload, { timeoutMs = 7000 } = {}) {
  if (IA_DISABLED) {
    const kind = String(path ?? '').toLowerCase();
    const recommendation = kind.includes('exercise')
      ? 'Moderate cardio'
      : kind.includes('nutrition')
        ? guessMealLabelFromNow()
        : 'Balanced diet';
    return { recommendation, confidence: null };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let lastError;
    for (const baseUrl of IA_BASE_URLS) {
      try {
        const url = `${baseUrl}${path}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload ?? {}),
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`IA HTTP ${res.status}${text ? `: ${text}` : ''}`);
        }

        return res.json();
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError ?? new Error('IA request failed');
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeRecommendationLabel(value) {
  const label = String(value ?? '').trim();
  return label;
}

function normalizeSodiumToGrams(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return null;
  // In Food table, sodium is stored as mg (from sodium_mg). Convert to grams.
  return raw / 1000;
}

function buildDietIaPayloadFromUser(user) {
  const heightM = normalizeUserHeightMeters(user?.taille);
  const weightKg = Number(user?.poids);
  const bmi = computeBmi(weightKg, heightM);
  const daily = Number(user?.daily_caloric_intake ?? 2000);

  return {
    age: Number(user?.age),
    weight_kg: weightKg,
    height_m: heightM ?? 1.7,
    bmi: bmi ?? 22,
    daily_caloric_intake_kcal: Number.isFinite(daily) ? daily : 2000,
  };
}

async function buildExerciseIaPayload({ user, userId, overrides } = {}) {
  const heightM = normalizeUserHeightMeters(user?.taille);
  const weightKg = Number(user?.poids);
  const bmi = computeBmi(weightKg, heightM);

  const now = Date.now();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const [latestRows, lastWeek] = await Promise.all([
    prisma.userExercise.findMany ? prisma.userExercise.findMany({ where: { user_id: userId }, orderBy: { date: 'desc' }, take: 1 }) : Promise.resolve([]),
    prisma.userExercise.findMany ? prisma.userExercise.findMany({ where: { user_id: userId, date: { gte: weekAgo } } }) : Promise.resolve([]),
  ]);

  const latest = Array.isArray(latestRows) && latestRows.length ? latestRows[0] : null;

  const caloriesBurned = overrides?.calories_burned ?? overrides?.caloriesBurned ?? latest?.calories_burned;
  const avgBpm = overrides?.avg_bpm ?? overrides?.avgBpm;
  const frequency = overrides?.workout_frequency_days_week
    ?? overrides?.workoutFrequencyDaysWeek
    ?? (Array.isArray(lastWeek) ? lastWeek.length : 0);

  // If we don't have enough tracked sports data, fall back to reasonable defaults.
  // This keeps bulk generation usable even when users don't log BPM/calories yet.
  const age = Number(user?.age);
  const maxHr = Number.isFinite(age) ? 220 - age : 190;
  const guessedAvgBpm = Math.max(105, Math.min(170, Math.round(maxHr * 0.65)));
  const guessedCaloriesBurned = Number.isFinite(Number(weightKg)) ? Math.max(120, Math.round(weightKg * 4.0)) : 300;

  const resolvedCaloriesBurned = Number.isFinite(Number(caloriesBurned)) ? Number(caloriesBurned) : guessedCaloriesBurned;
  const resolvedAvgBpm = Number.isFinite(Number(avgBpm)) ? Number(avgBpm) : guessedAvgBpm;
  const resolvedFrequency = Number.isFinite(Number(frequency)) && Number(frequency) >= 0 ? Number(frequency) : 0;

  const missing = [];
  if (!Number.isFinite(Number(resolvedCaloriesBurned))) missing.push('calories_burned');
  if (!Number.isFinite(Number(resolvedAvgBpm))) missing.push('avg_bpm');
  if (!Number.isFinite(Number(resolvedFrequency)) || Number(resolvedFrequency) < 0) missing.push('workout_frequency_days_week');
  if (missing.length) {
    return { ok: false, error: `Données sport insuffisantes: ${missing.join(', ')} (fournis-les dans le payload).` };
  }

  return {
    ok: true,
    referenceId: latest?.id ?? userId,
    payload: {
      age: Number(user?.age),
      weight_kg: weightKg,
      height_m: heightM ?? 1.7,
      bmi: bmi ?? 22,
      calories_burned: resolvedCaloriesBurned,
      avg_bpm: resolvedAvgBpm,
      workout_frequency_days_week: Math.max(0, Math.min(7, Math.round(resolvedFrequency))),
    },
  };
}

async function buildNutritionIaPayload({ userId, overrides } = {}) {
  // If macros are provided explicitly, prefer them.
  const fromOverrides = {
    calories_kcal: overrides?.calories_kcal ?? overrides?.caloriesKcal,
    protein_g: overrides?.protein_g ?? overrides?.proteinG,
    carbohydrates_g: overrides?.carbohydrates_g ?? overrides?.carbohydratesG,
    fat_g: overrides?.fat_g ?? overrides?.fatG,
    fiber_g: overrides?.fiber_g ?? overrides?.fiberG,
    sodium_g: overrides?.sodium_g ?? overrides?.sodiumG,
  };

  const hasAllOverrides = Object.values(fromOverrides).every((v) => Number.isFinite(Number(v)));
  if (hasAllOverrides) {
    return {
      ok: true,
      referenceId: userId,
      payload: {
        calories_kcal: Number(fromOverrides.calories_kcal),
        protein_g: Number(fromOverrides.protein_g),
        carbohydrates_g: Number(fromOverrides.carbohydrates_g),
        fat_g: Number(fromOverrides.fat_g),
        fiber_g: Number(fromOverrides.fiber_g),
        sodium_g: Number(fromOverrides.sodium_g),
      },
    };
  }

  // Otherwise, compute macros from the most recent meal with foods.
  let meal = null;
  if (prisma.meal?.findFirst) {
    meal = await prisma.meal.findFirst({
      where: { user_id: userId },
      orderBy: { date: 'desc' },
      include: {
        foods: {
          include: {
            food: true,
          },
        },
      },
    });
  } else if (prisma.meal?.findMany) {
    const rows = await prisma.meal.findMany({ where: { user_id: userId }, orderBy: { date: 'desc' }, take: 1 });
    meal = Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  const items = meal?.foods ?? [];
  if (!items.length) {
    return { ok: false, error: 'Données nutrition insuffisantes: aucun repas/food associé (ou fournis les macros dans le payload).' };
  }

  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber = 0;
  let sodiumG = 0;

  for (const mf of items) {
    const qty = Number(mf?.quantity ?? 1);
    const mult = Number.isFinite(qty) && qty > 0 ? qty : 1;
    const food = mf?.food;
    if (!food) continue;

    calories += Number(food.calories ?? 0) * mult;
    protein += Number(food.protein ?? 0) * mult;
    carbs += Number(food.carbohydrates ?? 0) * mult;
    fat += Number(food.fat ?? 0) * mult;
    fiber += Number(food.fiber ?? 0) * mult;
    const sodium = normalizeSodiumToGrams(food.sodium);
    sodiumG += (sodium ?? 0) * mult;
  }

  const payload = {
    calories_kcal: calories,
    protein_g: protein,
    carbohydrates_g: carbs,
    fat_g: fat,
    fiber_g: fiber,
    sodium_g: sodiumG,
  };

  const missing = Object.entries(payload)
    .filter(([, v]) => !Number.isFinite(Number(v)))
    .map(([k]) => k);
  if (missing.length) {
    return { ok: false, error: `Données nutrition invalides: ${missing.join(', ')}` };
  }

  return {
    ok: true,
    referenceId: meal?.id ?? userId,
    payload: {
      calories_kcal: Number(payload.calories_kcal),
      protein_g: Number(payload.protein_g),
      carbohydrates_g: Number(payload.carbohydrates_g),
      fat_g: Number(payload.fat_g),
      fiber_g: Number(payload.fiber_g),
      sodium_g: Number(payload.sodium_g),
    },
  };
}

function parseCookies(cookieHeader) {
  const cookies = {};
  const raw = String(cookieHeader ?? '');
  if (!raw) return cookies;

  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    cookies[k] = decodeURIComponent(rest.join('=') ?? '');
  }
  return cookies;
}

function buildSetCookie(name, value, { maxAgeSeconds } = {}) {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (typeof maxAgeSeconds === 'number') parts.push(`Max-Age=${maxAgeSeconds}`);
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

function buildEntityScopeSeed(index, total) {
  if (!total) return 0;
  return index % total;
}

function isLoopbackAddress(remoteAddress) {
  const addr = String(remoteAddress ?? '').trim();
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function normalizeIp(remoteAddress) {
  const raw = String(remoteAddress ?? '').trim();
  return raw.startsWith('::ffff:') ? raw.slice('::ffff:'.length) : raw;
}

function isPrivateAddress(remoteAddress) {
  const addr = normalizeIp(remoteAddress);
  if (!addr) return false;
  if (addr.startsWith('10.')) return true;
  if (addr.startsWith('192.168.')) return true;
  if (addr.startsWith('172.')) {
    const second = Number(addr.split('.')[1]);
    return Number.isFinite(second) && second >= 16 && second <= 31;
  }
  return false;
}

function hostIsLocal(hostHeader) {
  const host = String(hostHeader ?? '').trim().toLowerCase();
  const hostname = host.includes(':') ? host.split(':')[0] : host;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

const HAS_DATABASE_URL = Boolean(process.env.DATABASE_URL?.trim());
const ALLOW_FALLBACK_DB = String(process.env.ALLOW_FALLBACK_DB ?? '').trim().toLowerCase() === 'true';
let prisma;

function getCorsHeaders(req) {
  const configured = process.env.CORS_ORIGIN;
  const requestOrigin = req?.headers?.origin;

  const configuredList = String(configured ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const allowAny = configuredList.includes('*');

  let allowOrigin = '*';
  if (requestOrigin) {
    if (!configuredList.length || allowAny || configuredList.includes(requestOrigin)) {
      // Echo back the requesting origin to support credentials.
      allowOrigin = requestOrigin;
    } else {
      allowOrigin = configuredList[0] ?? '*';
    }
  } else if (configuredList.length) {
    allowOrigin = configuredList[0];
  }

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };

  if (allowOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

function sendJson(req, res, statusCode, payload, extraHeaders = undefined) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...getCorsHeaders(req),
    ...(extraHeaders ?? {}),
  });
  res.end(body);
}

function sendNoContent(req, res, extraHeaders = undefined) {
  res.writeHead(204, {
    ...getCorsHeaders(req),
    ...(extraHeaders ?? {}),
  });
  res.end();
}

function parseNumber(value) {
  if (value === null || value === undefined) return undefined;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function parseIntSafe(value) {
  const n = parseNumber(value);
  if (n === undefined) return undefined;
  return Number.isInteger(n) ? n : Math.trunc(n);
}

async function readJsonBody(req) {
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve(undefined);
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function getEnterpriseSessionFromRequest(req) {
  const cookies = parseCookies(req?.headers?.cookie);
  return cookies[ENTERPRISE_SESSION_COOKIE]
    ? verifyEnterpriseSessionToken(cookies[ENTERPRISE_SESSION_COOKIE])
    : null;
}

function serializeEnterprise(enterprise) {
  if (!enterprise) return null;
  return {
    id: enterprise.id,
    slug: enterprise.slug,
    email: enterprise.email,
    name: enterprise.name,
    sector: enterprise.sector,
    createdAt: enterprise.createdAt,
  };
}

function toUserResponse(user) {
  if (!user) return null;
  return {
    ...user,
    enterprise_id: user.enterprise_id ?? null,
  };
}

function toRecommendationResponse(recommendation) {
  if (!recommendation) return null;
  const user = recommendation.user;
  const enterprise = user?.enterprise;
  return {
    id: recommendation.id,
    userId: String(recommendation.user_id),
    type: recommendation.type,
    details: recommendation.reason ?? recommendation.type,
    confidenceLevel: recommendation.score ?? undefined,
    userName: user?.nom ?? undefined,
    enterpriseId: user?.enterprise_id != null ? String(user.enterprise_id) : undefined,
    enterpriseName: enterprise?.name ?? undefined,
    createdAt: recommendation.created_at,
    updatedAt: recommendation.created_at,
  };
}

const NUTRITION_FOOD_SUGGESTION_TTL_MS = 10 * 60 * 1000;
let nutritionFoodSuggestionCache = { at: 0, value: null };

function normalizeMealLabel(label) {
  const raw = typeof label === 'string' ? label.trim() : '';
  if (!raw) return { key: null, raw: '' };
  const key = raw.toLowerCase();
  return { key, raw };
}

function formatMealLabelFr(label) {
  const { key, raw } = normalizeMealLabel(label);
  if (!key) return '';
  if (key === 'breakfast') return 'Petit-déjeuner';
  if (key === 'lunch') return 'Déjeuner';
  if (key === 'dinner') return 'Dîner';
  if (key === 'snack') return 'Collation';
  return raw;
}

function joinNames(foods, max = 3) {
  return (foods ?? [])
    .map((f) => (f?.name ? String(f.name).trim() : ''))
    .filter(Boolean)
    .slice(0, max)
    .join(', ');
}

function guessMealLabelFromNow(now = new Date()) {
  const hours = now.getHours();
  if (hours >= 5 && hours < 11) return 'Breakfast';
  if (hours >= 11 && hours < 17) return 'Lunch';
  return 'Dinner';
}

function isNutritionInsufficientDataError(message) {
  const msg = String(message ?? '').toLowerCase();
  return msg.includes('données nutrition insuffisantes')
    || msg.includes('aucun repas/food associé')
    || msg.includes('insuffisantes');
}

function extractBareNutritionLabelFromReason(reason) {
  const raw = typeof reason === 'string' ? reason.trim() : '';
  if (!raw) return null;
  // Only enrich the minimal legacy form, not already enriched strings.
  // Example: "IA nutrition: Lunch"
  const match = raw.match(/^IA\s+nutrition\s*:\s*([A-Za-z_\-]+)\s*$/i);
  if (!match) return null;
  return match[1];
}

async function toRecommendationResponseAsync(recommendation) {
  const base = toRecommendationResponse(recommendation);
  if (!base) return base;
  if (recommendation?.type === 'nutrition') {
    const label = extractBareNutritionLabelFromReason(recommendation?.reason);
    if (label) {
      base.details = await buildNutritionReason(label);
    }
  }
  return base;
}

function parseBooleanParam(value) {
  if (value == null) return false;
  const s = String(value).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

function getUtcDayKey(value) {
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return 'invalid';
  dt.setUTCHours(0, 0, 0, 0);
  return dt.toISOString().slice(0, 10);
}

function extractLabelForDedupe(recommendation) {
  const raw = typeof recommendation?.reason === 'string' ? recommendation.reason.trim() : '';
  if (!raw) return '';

  if (recommendation?.type === 'nutrition') {
    const bare = extractBareNutritionLabelFromReason(raw);
    if (bare) return String(bare).trim().toLowerCase();

    // Handle enriched forms, e.g. "IA nutrition: Déjeuner (Lunch) — ..."
    const prefix = raw.match(/^IA\s+nutrition\s*:\s*([^—]+)(?:—|$)/i);
    const head = (prefix?.[1] ?? '').trim();
    const paren = head.match(/\(([^)]+)\)/);
    if (paren?.[1]) return String(paren[1]).trim().toLowerCase();
    if (head) return head.toLowerCase();
  }

  // Typical shapes:
  // - "IA nutrition: Lunch"
  // - "IA diet: XYZ"
  // - "IA exercise: XYZ"
  const match = raw.match(/^IA\s+[a-z]+\s*:\s*(.+)$/i);
  const afterPrefix = match ? match[1].trim() : raw;
  const beforeDash = afterPrefix.split('—')[0].trim();
  return beforeDash.toLowerCase();
}

function dedupeRecommendationsForPortfolio(recommendations) {
  const seen = new Set();
  const out = [];
  for (const r of recommendations ?? []) {
    const day = getUtcDayKey(r?.created_at ?? r?.createdAt ?? r?.createdAt);
    const label = extractLabelForDedupe(r);
    const key = `${String(r?.user_id ?? r?.userId ?? '')}|${String(r?.type ?? '')}|${day}|${label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

async function getNutritionFoodSuggestionPools() {
  const now = Date.now();
  if (nutritionFoodSuggestionCache?.value && now - nutritionFoodSuggestionCache.at < NUTRITION_FOOD_SUGGESTION_TTL_MS) {
    return nutritionFoodSuggestionCache.value;
  }

  const isProbablyBeverage = (food) => {
    const name = String(food?.name ?? '').toLowerCase();
    const category = String(food?.category ?? '').toLowerCase();
    if (!name && !category) return false;
    if (category.includes('beverage') || category.includes('drink') || category.includes('boisson')) return true;
    return /\b(tea|coffee|latte|espresso|soda|cola|juice|smoothie|bubble|milk\s*tea|beer|wine|cocktail)\b/i.test(name);
  };

  const takeTop = (foods, selector, take = 8) => {
    const list = (foods ?? [])
      .filter((f) => f && f.name)
      .filter((f) => !isProbablyBeverage(f))
      .sort((a, b) => Number(selector(b) ?? 0) - Number(selector(a) ?? 0));
    return list.slice(0, take);
  };

  const uniqueById = (foods) => {
    const map = new Map();
    for (const f of foods ?? []) {
      const id = f?.id;
      if (id == null) continue;
      if (!map.has(id)) map.set(id, f);
    }
    return Array.from(map.values());
  };

  // Prefer foods that actually appear in recorded meals (more "plats"/realistic examples).
  let recentMealFoods = [];
  if (prisma.meal?.findMany) {
    const meals = await prisma.meal.findMany({
      orderBy: { date: 'desc' },
      take: 150,
      include: {
        foods: {
          include: { food: true },
        },
      },
    });

    for (const meal of meals ?? []) {
      for (const mf of meal?.foods ?? []) {
        if (mf?.food) recentMealFoods.push(mf.food);
      }
    }
  }

  recentMealFoods = uniqueById(recentMealFoods);

  const poolsFromMeals = {
    protein: takeTop(recentMealFoods, (f) => f?.protein),
    carbs: takeTop(recentMealFoods, (f) => f?.carbohydrates),
    fiber: takeTop(recentMealFoods, (f) => f?.fiber),
    fat: takeTop(recentMealFoods, (f) => f?.fat),
  };

  const hasEnoughFromMeals =
    poolsFromMeals.protein.length >= 3
    && poolsFromMeals.carbs.length >= 3
    && poolsFromMeals.fiber.length >= 3
    && poolsFromMeals.fat.length >= 3;

  if (hasEnoughFromMeals) {
    nutritionFoodSuggestionCache = { at: now, value: poolsFromMeals };
    return poolsFromMeals;
  }

  const [protein, carbs, fiber, fat] = await Promise.all([
    prisma.food.findMany({ orderBy: { protein: 'desc' }, take: 8 }),
    prisma.food.findMany({ orderBy: { carbohydrates: 'desc' }, take: 8 }),
    prisma.food.findMany({ orderBy: { fiber: 'desc' }, take: 8 }),
    prisma.food.findMany({ orderBy: { fat: 'desc' }, take: 8 }),
  ]);

  const value = {
    protein: protein.filter((f) => !isProbablyBeverage(f)),
    carbs: carbs.filter((f) => !isProbablyBeverage(f)),
    fiber: fiber.filter((f) => !isProbablyBeverage(f)),
    fat: fat.filter((f) => !isProbablyBeverage(f)),
  };
  nutritionFoodSuggestionCache = { at: now, value };
  return value;
}

async function buildNutritionReason(label) {
  const mealFr = formatMealLabelFr(label);
  const pools = await getNutritionFoodSuggestionPools();

  const parts = [];
  if (mealFr) {
    parts.push(`IA nutrition: ${mealFr} (${String(label).trim()})`);
  } else {
    parts.push(`IA nutrition: ${String(label ?? '').trim() || 'Suggestion repas'}`);
  }

  const proteinNames = joinNames(pools.protein);
  const carbsNames = joinNames(pools.carbs);
  const fiberNames = joinNames(pools.fiber);
  const fatNames = joinNames(pools.fat);

  const suggestionBits = [];
  if (proteinNames) suggestionBits.push(`protéines: ${proteinNames}`);
  if (carbsNames) suggestionBits.push(`glucides: ${carbsNames}`);
  if (fiberNames) suggestionBits.push(`fibres/légumes: ${fiberNames}`);
  if (fatNames) suggestionBits.push(`bonnes graisses: ${fatNames}`);

  if (suggestionBits.length) {
    parts.push(`Exemples d'aliments (${suggestionBits.join(' • ')})`);
  }

  return parts.join(' — ');
}

function parseNumberParam(value) {
  if (value == null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseDateParam(value) {
  if (!value) return undefined;
  const dt = new Date(String(value));
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt;
}

function buildRecommendationsWhereFromQuery({
  type,
  q,
  periodDays,
  from,
  to,
  enterpriseId,
  forceEnterpriseId,
}) {
  const and = [];

  const effectiveEnterpriseId = forceEnterpriseId ?? enterpriseId;
  if (effectiveEnterpriseId != null) {
    and.push({ user: { enterprise_id: effectiveEnterpriseId } });
  }

  if (type) {
    and.push({ type });
  }

  const createdAt = {};
  const period = parseNumberParam(periodDays);
  const fromDt = parseDateParam(from);
  const toDt = parseDateParam(to);

  if (period != null && period > 0) {
    const since = new Date();
    since.setDate(since.getDate() - Math.floor(period));
    createdAt.gte = since;
  }

  if (fromDt) createdAt.gte = fromDt;
  if (toDt) createdAt.lte = toDt;
  if (Object.keys(createdAt).length) {
    and.push({ created_at: createdAt });
  }

  const qStr = typeof q === 'string' ? q.trim() : '';
  if (qStr) {
    const or = [];
    const asId = Number(qStr);
    if (Number.isFinite(asId)) {
      or.push({ user_id: asId });
    }

    or.push({ user: { nom: { contains: qStr } } });
    or.push({ reason: { contains: qStr } });
    or.push({ type: { contains: qStr } });
    or.push({ user: { enterprise: { name: { contains: qStr } } } });

    and.push({ OR: or });
  }

  if (!and.length) return undefined;
  return { AND: and };
}

const DEFAULT_SETTINGS = Object.freeze({
  theme: 'light',
  notificationsEnabled: true,
  language: 'fr',
  privacySettings: {
    dataSharing: false,
    personalizedAds: false,
  },
});

function getSettingsScope(session, enterpriseSession) {
  if (session?.adminId) return `admin:${session.adminId}`;
  if (enterpriseSession?.enterpriseId) return `enterprise:${enterpriseSession.enterpriseId}`;
  return null;
}

function normalizeSettings(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};
  const theme = input.theme === 'dark' || input.theme === 'light' ? input.theme : DEFAULT_SETTINGS.theme;
  const notificationsEnabled = typeof input.notificationsEnabled === 'boolean'
    ? input.notificationsEnabled
    : DEFAULT_SETTINGS.notificationsEnabled;
  const language = typeof input.language === 'string' && input.language.trim()
    ? input.language.trim()
    : DEFAULT_SETTINGS.language;

  const privacyInput = input.privacySettings && typeof input.privacySettings === 'object' ? input.privacySettings : {};
  const privacySettings = {
    dataSharing: typeof privacyInput.dataSharing === 'boolean' ? privacyInput.dataSharing : DEFAULT_SETTINGS.privacySettings.dataSharing,
    personalizedAds: typeof privacyInput.personalizedAds === 'boolean'
      ? privacyInput.personalizedAds
      : DEFAULT_SETTINGS.privacySettings.personalizedAds,
  };

  return {
    theme,
    notificationsEnabled,
    language,
    privacySettings,
  };
}

function mergeSettings(base, patch) {
  const baseNormalized = normalizeSettings(base);
  if (!patch || typeof patch !== 'object') return baseNormalized;

  const privacyPatch = patch.privacySettings && typeof patch.privacySettings === 'object' ? patch.privacySettings : {};

  return normalizeSettings({
    ...baseNormalized,
    ...patch,
    privacySettings: {
      ...baseNormalized.privacySettings,
      ...privacyPatch,
    },
  });
}

async function ensureEnterpriseBootstrap() {
  for (const account of DEFAULT_ENTERPRISE_ACCOUNTS) {
    await prisma.enterprise.upsert({
      where: { slug: account.slug },
      update: {
        name: account.name,
        email: account.email,
        sector: account.sector,
      },
      create: {
        slug: account.slug,
        name: account.name,
        email: account.email,
        passwordHash: hashPassword(account.password),
        sector: account.sector,
      },
    });
  }

  const enterprises = await prisma.enterprise.findMany({ orderBy: { id: 'asc' } });
  if (!enterprises.length) return enterprises;

  const usersToAssign = await prisma.utilisateur.findMany({
    where: { enterprise_id: null },
    orderBy: { id: 'asc' },
  });

  for (const [index, user] of usersToAssign.entries()) {
    const target = enterprises[buildEntityScopeSeed(index, enterprises.length)];
    if (!target) continue;
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { enterprise_id: target.id },
    });
  }

  return enterprises;
}

async function getEnterpriseBySession(session) {
  if (!session?.enterpriseId) return null;
  return prisma.enterprise.findUnique({ where: { id: Number(session.enterpriseId) } });
}

async function getScopedEnterpriseUsers(enterpriseId) {
  return prisma.utilisateur.findMany({
    where: { enterprise_id: Number(enterpriseId) },
    orderBy: { id: 'asc' },
  });
}

async function getScopedEnterpriseActivities(enterpriseId) {
  const [meals, exercises, recommendations] = await Promise.all([
    prisma.meal.findMany({
      where: { user: { enterprise_id: Number(enterpriseId) } },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.userExercise.findMany({
      where: { user: { enterprise_id: Number(enterpriseId) } },
      orderBy: { date: 'desc' },
      take: 50,
      include: { user: true, exercise: true },
    }),
    prisma.recommendation.findMany({
      where: { user: { enterprise_id: Number(enterpriseId) } },
      orderBy: { created_at: 'desc' },
      take: 50,
    }),
  ]);

  return { meals, exercises, recommendations };
}

function buildWeeklySeriesFromDates(records, dateKey, valueSelector) {
  const now = new Date();
  const buckets = Array.from({ length: 8 }).map((_, index) => ({
    label: `S-${7 - index}`,
    nutrition: 0,
    sport: 0,
    total: 0,
  }));

  records.forEach((record) => {
    const raw = record?.[dateKey];
    const parsed = raw ? new Date(raw) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) return;
    const diffDays = Math.floor((now.getTime() - parsed.getTime()) / 86_400_000);
    const bucketIndex = Math.max(0, Math.min(7, 7 - Math.floor(diffDays / 7)));
    const value = valueSelector(record);
    buckets[bucketIndex].nutrition += value.nutrition;
    buckets[bucketIndex].sport += value.sport;
    buckets[bucketIndex].total += value.total;
  });

  return buckets;
}

function percentileBucket(count, total) {
  if (!total) return 0;
  return Math.max(0, Math.min(1, count / total));
}

async function buildEnterpriseDashboardData(enterpriseId) {
  const [users, activities] = await Promise.all([
    getScopedEnterpriseUsers(enterpriseId),
    getScopedEnterpriseActivities(enterpriseId),
  ]);

  const activityEvents = [
    ...activities.meals.map((entry) => ({
      userId: String(entry.user_id),
      activityType: `meal:${entry.meal_type}`,
      timestamp: entry.date,
    })),
    ...activities.exercises.map((entry) => ({
      userId: String(entry.user_id),
      activityType: `exercise:${entry.exercise?.exercise_type ?? 'session'}`,
      timestamp: entry.date,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 500);

  const calories = users.map((user) => Number(user.daily_caloric_intake)).filter((value) => Number.isFinite(value));
  const averageCalories = calories.length ? Math.round(calories.reduce((sum, value) => sum + value, 0) / calories.length) : 0;
  const adherenceValues = users.map((user) => Number(user.adherence_to_diet_plan ?? 0)).filter((value) => Number.isFinite(value));
  const averageAdherence = adherenceValues.length
    ? adherenceValues.reduce((sum, value) => sum + value, 0) / adherenceValues.length
    : 0;

  const activeUsers = users.length;
  const newSignUps = await prisma.utilisateur.count({
    where: {
      enterprise_id: Number(enterpriseId),
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  }).catch(() => Math.max(0, Math.round(activeUsers * 0.12)));

  const activeFromActivities = new Set([
    ...activities.exercises.map((item) => item.user_id),
    ...activities.meals.map((item) => item.user_id),
  ]);

  const engagedUsers = users.filter((user) => activeFromActivities.has(user.id)).length;
  const nutritionPlans = activities.meals.length;
  const workoutPrograms = activities.exercises.length;

  return {
    kpis: {
      activeUsers,
      newSignUps,
      premiumConversionRate: activeUsers ? Math.min(0.95, Math.max(0.08, averageAdherence || 0.18)) : 0,
      retentionRate: activeUsers ? Math.min(0.96, Math.max(0.42, engagedUsers / activeUsers)) : 0,
      averageCalories: averageCalories || 0,
      workoutSessions: activities.exercises.length,
      generatedNutritionPlans: nutritionPlans,
      generatedWorkoutPrograms: workoutPrograms,
    },
    activityEvents,
    userActivities: activities.exercises.slice(0, 5).map((entry) => ({
      userId: String(entry.user_id),
      activityType: `exercise:${entry.exercise?.exercise_type ?? 'session'}`,
      timestamp: entry.date,
    })),
    alerts: users.length ? [] : ['Aucun utilisateur rattaché à cette entreprise.'],
    topPartners: [],
    engagementMetrics: {
      nutrition: percentileBucket(activities.meals.length, activities.meals.length + activities.exercises.length),
      sport: percentileBucket(activities.exercises.length, activities.meals.length + activities.exercises.length),
    },
  };
}

async function buildAdminDashboardData() {
  const [users, meals, exercises] = await Promise.all([
    prisma.utilisateur.findMany({ orderBy: { id: 'asc' } }),
    prisma.meal.findMany({ orderBy: { date: 'desc' }, take: 100 }),
    prisma.userExercise.findMany({ orderBy: { date: 'desc' }, take: 100, include: { user: true, exercise: true } }),
  ]);

  const activityEvents = [
    ...meals.map((entry) => ({
      userId: String(entry.user_id),
      activityType: `meal:${entry.meal_type}`,
      timestamp: entry.date,
    })),
    ...exercises.map((entry) => ({
      userId: String(entry.user_id),
      activityType: `exercise:${entry.exercise?.exercise_type ?? 'session'}`,
      timestamp: entry.date,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 500);

  const calories = users.map((user) => Number(user.daily_caloric_intake)).filter((value) => Number.isFinite(value));
  const averageCalories = calories.length ? Math.round(calories.reduce((sum, value) => sum + value, 0) / calories.length) : 0;

  const adherenceValues = users.map((user) => Number(user.adherence_to_diet_plan ?? 0)).filter((value) => Number.isFinite(value));
  const averageAdherence = adherenceValues.length
    ? adherenceValues.reduce((sum, value) => sum + value, 0) / adherenceValues.length
    : 0;

  const activeUsers = users.length;
  const newSignUps = await prisma.utilisateur.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const activeFromActivities = new Set([
    ...exercises.map((item) => item.user_id),
    ...meals.map((item) => item.user_id),
  ]);
  const engagedUsers = users.filter((user) => activeFromActivities.has(user.id)).length;

  return {
    kpis: {
      activeUsers,
      newSignUps,
      premiumConversionRate: activeUsers ? Math.min(0.95, Math.max(0.08, averageAdherence || 0.18)) : 0,
      retentionRate: activeUsers ? Math.min(0.96, Math.max(0.0, engagedUsers / activeUsers)) : 0,
      averageCalories: averageCalories || 0,
      workoutSessions: exercises.length,
      generatedNutritionPlans: meals.length,
      generatedWorkoutPrograms: exercises.length,
    },
    activityEvents,
    userActivities: exercises.slice(0, 5).map((entry) => ({
      userId: String(entry.user_id),
      activityType: `exercise:${entry.exercise?.exercise_type ?? 'session'}`,
      timestamp: entry.date,
    })),
    alerts: users.length ? [] : ['Aucun utilisateur.'],
    topPartners: [],
    engagementMetrics: {
      nutrition: percentileBucket(meals.length, meals.length + exercises.length),
      sport: percentileBucket(exercises.length, meals.length + exercises.length),
    },
  };
}

async function buildEnterpriseAnalyticsData(enterpriseId) {
  const [users, activities] = await Promise.all([
    getScopedEnterpriseUsers(enterpriseId),
    getScopedEnterpriseActivities(enterpriseId),
  ]);

  const calories = users.map((user) => Number(user.daily_caloric_intake)).filter((value) => Number.isFinite(value));
  const averageCalories = calories.length ? calories.reduce((sum, value) => sum + value, 0) / calories.length : 0;
  const adherenceValues = users.map((user) => Number(user.adherence_to_diet_plan ?? 0)).filter((value) => Number.isFinite(value));
  const averageAdherence = adherenceValues.length
    ? adherenceValues.reduce((sum, value) => sum + value, 0) / adherenceValues.length
    : 0;

  const groupedWeeks = buildWeeklySeriesFromDates(
    [
      ...activities.meals.map((item) => ({ date: item.date, type: 'nutrition' })),
      ...activities.exercises.map((item) => ({ date: item.date, type: 'sport' })),
    ],
    'date',
    (record) => ({ nutrition: record.type === 'nutrition' ? 1 : 0, sport: record.type === 'sport' ? 1 : 0, total: 1 })
  ).map((item) => ({
    date: item.label,
    nutritionEngagement: item.nutrition,
    sportEngagement: item.sport,
  }));

  const premiumPlus = users.filter((user) => Number(user.adherence_to_diet_plan ?? 0) >= 0.85).length;
  const premium = users.filter((user) => {
    const score = Number(user.adherence_to_diet_plan ?? 0);
    return score >= 0.65 && score < 0.85;
  }).length;
  const free = Math.max(0, users.length - premium - premiumPlus);

  return {
    kpi: {
      activeUsers: users.length,
      newSignUps: await prisma.utilisateur.count({
        where: {
          enterprise_id: Number(enterpriseId),
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }).catch(() => Math.max(0, Math.round(users.length * 0.12))),
      premiumConversionRate: users.length ? Math.min(0.95, Math.max(0.08, averageAdherence || 0.18)) : 0,
      retentionRate: users.length ? Math.min(0.96, Math.max(0.42, activities.exercises.length / Math.max(1, users.length))) : 0,
      averageSessions: users.length ? Math.max(1, Math.round(activities.exercises.length / users.length)) : 0,
      averageCalories: Math.round(averageCalories) || 0,
      generatedNutritionPlans: activities.meals.length,
      generatedWorkoutPrograms: activities.exercises.length,
    },
    userEngagement: groupedWeeks,
    subscriptionDistribution: [
      { subscriptionType: 'free', count: free },
      { subscriptionType: 'premium', count: premium },
      { subscriptionType: 'premiumPlus', count: premiumPlus },
    ],
    alerts: users.length ? [] : ['Aucun utilisateur rattaché à cette entreprise.'],
    topPartners: [],
    topSegments: Array.from(new Set(users.map((user) => user.disease_type ?? user.physical_activity_level ?? 'Segment général').filter(Boolean))).slice(0, 3),
  };
}

async function buildAdminAnalyticsData() {
  const [users, meals, exercises] = await Promise.all([
    prisma.utilisateur.findMany({ orderBy: { id: 'asc' } }),
    prisma.meal.findMany({ orderBy: { date: 'desc' }, take: 500 }),
    prisma.userExercise.findMany({ orderBy: { date: 'desc' }, take: 500 }),
  ]);

  const calories = users.map((user) => Number(user.daily_caloric_intake)).filter((value) => Number.isFinite(value));
  const averageCalories = calories.length ? calories.reduce((sum, value) => sum + value, 0) / calories.length : 0;

  const adherenceValues = users.map((user) => Number(user.adherence_to_diet_plan ?? 0)).filter((value) => Number.isFinite(value));
  const averageAdherence = adherenceValues.length
    ? adherenceValues.reduce((sum, value) => sum + value, 0) / adherenceValues.length
    : 0;

  const groupedWeeks = buildWeeklySeriesFromDates(
    [
      ...meals.map((item) => ({ date: item.date, type: 'nutrition' })),
      ...exercises.map((item) => ({ date: item.date, type: 'sport' })),
    ],
    'date',
    (record) => ({ nutrition: record.type === 'nutrition' ? 1 : 0, sport: record.type === 'sport' ? 1 : 0, total: 1 })
  ).map((item) => ({
    date: item.label,
    nutritionEngagement: item.nutrition,
    sportEngagement: item.sport,
  }));

  const premiumPlus = users.filter((user) => Number(user.adherence_to_diet_plan ?? 0) >= 0.85).length;
  const premium = users.filter((user) => {
    const score = Number(user.adherence_to_diet_plan ?? 0);
    return score >= 0.65 && score < 0.85;
  }).length;
  const free = Math.max(0, users.length - premium - premiumPlus);

  return {
    kpi: {
      activeUsers: users.length,
      newSignUps: await prisma.utilisateur.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      premiumConversionRate: users.length ? Math.min(0.95, Math.max(0.08, averageAdherence || 0.18)) : 0,
      retentionRate: users.length ? Math.min(0.96, Math.max(0.0, exercises.length / Math.max(1, users.length))) : 0,
      averageSessions: users.length ? Math.max(0, Math.round(exercises.length / users.length)) : 0,
      averageCalories: Math.round(averageCalories) || 0,
      generatedNutritionPlans: meals.length,
      generatedWorkoutPrograms: exercises.length,
    },
    userEngagement: groupedWeeks,
    subscriptionDistribution: [
      { subscriptionType: 'free', count: free },
      { subscriptionType: 'premium', count: premium },
      { subscriptionType: 'premiumPlus', count: premiumPlus },
    ],
    alerts: users.length ? [] : ['Aucun utilisateur.'],
    topPartners: [],
    topSegments: Array.from(
      new Set(users.map((user) => user.disease_type ?? user.physical_activity_level ?? 'Segment général').filter(Boolean))
    ).slice(0, 5),
  };
}

async function buildNutritionAnalyticsData() {
  const foods = await prisma.food.findMany({ orderBy: { id: 'asc' } });
  const totalFoods = foods.length;
  const avg = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

  const averageCalories = avg(foods.map((f) => Number(f.calories)).filter((v) => Number.isFinite(v)));
  const averageProtein = avg(foods.map((f) => Number(f.protein)).filter((v) => Number.isFinite(v)));
  const averageCarbs = avg(foods.map((f) => Number(f.carbohydrates)).filter((v) => Number.isFinite(v)));
  const averageFat = avg(foods.map((f) => Number(f.fat)).filter((v) => Number.isFinite(v)));

  const byCategory = new Map();
  for (const food of foods) {
    const category = String(food.category ?? 'unknown');
    const current = byCategory.get(category) ?? { sum: 0, count: 0 };
    const calories = Number(food.calories);
    if (Number.isFinite(calories)) {
      current.sum += calories;
      current.count += 1;
    }
    byCategory.set(category, current);
  }

  const caloriesSeries = [...byCategory.entries()]
    .map(([category, info]) => ({
      name: category,
      value: info.count ? Math.round(info.sum / info.count) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    totalFoods,
    averageCalories: Math.round(averageCalories) || 0,
    averageMacros: {
      protein: Math.round(averageProtein) || 0,
      carbohydrates: Math.round(averageCarbs) || 0,
      fat: Math.round(averageFat) || 0,
    },
    caloriesSeries,
  };
}

prisma = HAS_DATABASE_URL ? new PrismaClient() : (ALLOW_FALLBACK_DB ? createFallbackDatabase() : null);

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) return sendJson(req, res, 400, { error: 'Missing URL' });

    if (req.method === 'OPTIONS') return sendNoContent(req, res);

    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;

    if (!prisma && path.startsWith('/api/') && path !== '/api/features') {
      return sendJson(req, res, 503, { error: 'DATABASE_URL non configurée. API indisponible.' });
    }

    const cookies = parseCookies(req.headers.cookie);
    const session = cookies[ADMIN_SESSION_COOKIE]
      ? verifyAdminSessionToken(cookies[ADMIN_SESSION_COOKIE])
      : null;
    const enterpriseSession = cookies[ENTERPRISE_SESSION_COOKIE]
      ? verifyEnterpriseSessionToken(cookies[ENTERPRISE_SESSION_COOKIE])
      : null;

    if (req.method === 'GET' && path === '/health') {
      return sendJson(req, res, 200, { ok: true });
    }

    if (req.method === 'GET' && path === '/api/features') {
      return sendJson(req, res, 200, []);
    }

    if (req.method === 'GET' && path === '/api/admin/me') {
      if (!session) return sendJson(req, res, 401, { error: 'Connexion admin requise.' });
      return sendJson(req, res, 200, { adminId: session.adminId, email: session.email });
    }

    if (req.method === 'GET' && path === '/api/admin/dashboard') {
      if (!session) return sendJson(req, res, 401, { error: 'Connexion admin requise.' });
      const dashboard = await buildAdminDashboardData();
      return sendJson(req, res, 200, dashboard);
    }

    if (req.method === 'GET' && path === '/api/admin/analytics') {
      if (!session) return sendJson(req, res, 401, { error: 'Connexion admin requise.' });
      const analytics = await buildAdminAnalyticsData();
      return sendJson(req, res, 200, analytics);
    }

    if (req.method === 'POST' && path === '/api/admin/logout') {
      const setCookie = buildSetCookie(ADMIN_SESSION_COOKIE, '', { maxAgeSeconds: 0 });
      return sendJson(req, res, 200, { ok: true }, { 'Set-Cookie': setCookie });
    }

    if (req.method === 'POST' && path === '/api/admin/register') {
      // First-admin bootstrap: only from localhost and only if no admin exists.
      const remoteAddress = req.socket?.remoteAddress;
      const allowLocal = isLoopbackAddress(remoteAddress)
        || (isPrivateAddress(remoteAddress) && hostIsLocal(req.headers?.host));

      if (!allowLocal) {
        return sendJson(req, res, 403, { error: 'Création admin autorisée uniquement depuis localhost.' });
      }

      const existingAdminsCount = await prisma.admin.count();
      if (existingAdminsCount > 0) {
        return sendJson(req, res, 403, { error: 'Un compte admin existe déjà.' });
      }

      const body = await readJsonBody(req);
      const email = String(body?.email ?? '').trim().toLowerCase();
      const password = String(body?.password ?? '');

      if (!email || !password) {
        return sendJson(req, res, 400, { error: 'Email et mot de passe requis.' });
      }
      if (password.length < 8) {
        return sendJson(req, res, 400, { error: 'Mot de passe minimum 8 caractères.' });
      }

      const existing = await prisma.admin.findUnique({ where: { email } });
      if (existing) {
        return sendJson(req, res, 409, { error: 'Un admin avec cet email existe déjà.' });
      }

      const created = await prisma.admin.create({
        data: {
          email,
          passwordHash: hashPassword(password),
        },
      });

      const token = createAdminSessionToken(created.id, created.email);
      const setCookie = buildSetCookie(ADMIN_SESSION_COOKIE, token, { maxAgeSeconds: SESSION_DURATION_SECONDS });

      return sendJson(req, res, 200, { id: created.id, email: created.email }, { 'Set-Cookie': setCookie });
    }

    if (req.method === 'POST' && path === '/api/admin/login') {
      const body = await readJsonBody(req);
      const email = String(body?.email ?? '').trim().toLowerCase();
      const password = String(body?.password ?? '');

      if (!email || !password) {
        return sendJson(req, res, 400, { error: 'Email et mot de passe requis.' });
      }

      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin || !verifyPassword(password, admin.passwordHash)) {
        return sendJson(req, res, 401, { error: 'Identifiants invalides.' });
      }

      const token = createAdminSessionToken(admin.id, admin.email);
      const setCookie = buildSetCookie(ADMIN_SESSION_COOKIE, token, { maxAgeSeconds: SESSION_DURATION_SECONDS });

      return sendJson(req, res, 200, { id: admin.id, email: admin.email }, { 'Set-Cookie': setCookie });
    }

    if (req.method === 'POST' && path === '/api/enterprise/login') {
      const body = await readJsonBody(req);
      const email = String(body?.email ?? '').trim().toLowerCase();
      const password = String(body?.password ?? '');

      if (!email || !password) {
        return sendJson(req, res, 400, { error: 'Email et mot de passe requis.' });
      }

      const enterprise = await prisma.enterprise.findUnique({ where: { email } });
      if (!enterprise || !verifyPassword(password, enterprise.passwordHash)) {
        return sendJson(req, res, 401, { error: 'Identifiants entreprise invalides.' });
      }

      const token = createEnterpriseSessionToken(enterprise);
      const setCookie = buildSetCookie(ENTERPRISE_SESSION_COOKIE, token, { maxAgeSeconds: SESSION_DURATION_SECONDS });

      return sendJson(
        req,
        res,
        200,
        {
          enterpriseId: enterprise.id,
          slug: enterprise.slug,
          email: enterprise.email,
          name: enterprise.name,
          sector: enterprise.sector,
        },
        { 'Set-Cookie': setCookie }
      );
    }

    if (req.method === 'GET' && path === '/api/enterprise/me') {
      if (!enterpriseSession) return sendJson(req, res, 401, { error: 'Connexion entreprise requise.' });
      const enterprise = await prisma.enterprise.findUnique({ where: { id: Number(enterpriseSession.enterpriseId) } });
      if (!enterprise) return sendJson(req, res, 401, { error: 'Session entreprise expirée.' });
      return sendJson(req, res, 200, {
        enterpriseId: enterprise.id,
        slug: enterprise.slug,
        email: enterprise.email,
        name: enterprise.name,
        sector: enterprise.sector,
      });
    }

    if (req.method === 'POST' && path === '/api/enterprise/logout') {
      const setCookie = buildSetCookie(ENTERPRISE_SESSION_COOKIE, '', { maxAgeSeconds: 0 });
      return sendJson(req, res, 200, { ok: true }, { 'Set-Cookie': setCookie });
    }

    // Public user creation (non-admin)
    if (req.method === 'POST' && path === '/api/utilisateurs') {
      const body = await readJsonBody(req);

      const nom = String(body?.nom ?? body?.name ?? '').trim();
      const age = parseIntSafe(body?.age);
      const gender = String(body?.gender ?? '').trim();

      const poids = parseNumber(body?.poids ?? body?.weight_kg);

      // Allow either meters or centimeters on input
      let taille = parseNumber(body?.taille ?? body?.height_m);
      const heightCm = parseNumber(body?.height_cm);
      if (taille === undefined && heightCm !== undefined) taille = heightCm / 100;

      if (!nom) return sendJson(req, res, 400, { error: 'nom requis.' });
      if (age === undefined || age <= 0 || age > 130) return sendJson(req, res, 400, { error: 'age invalide.' });
      if (!gender) return sendJson(req, res, 400, { error: 'gender requis.' });
      if (poids === undefined || poids <= 0) return sendJson(req, res, 400, { error: 'poids invalide.' });
      if (taille === undefined || taille <= 0) return sendJson(req, res, 400, { error: 'taille invalide.' });

      const created = await prisma.utilisateur.create({
        data: {
          nom,
          age,
          gender,
          poids,
          taille,
          disease_type: body?.disease_type ?? body?.diseaseType ?? null,
          disease_severity: body?.disease_severity ?? body?.diseaseSeverity ?? null,
          daily_caloric_intake: parseIntSafe(body?.daily_caloric_intake ?? body?.daily_caloric_intake_kcal) ?? null,
          adherence_to_diet_plan: parseNumber(body?.adherence_to_diet_plan ?? body?.adherenceToDietPlan) ?? null,
          physical_activity_level: body?.physical_activity_level ?? body?.physicalActivityLevel ?? null,
        },
      });

      return sendJson(req, res, 201, created);
    }

    if (req.method === 'GET' && path === '/api/utilisateurs') {
      if (!session) return sendJson(req, res, 401, { error: 'Connexion admin requise.' });
      const users = await prisma.utilisateur.findMany({ orderBy: { id: 'asc' } });
      return sendJson(req, res, 200, users);
    }

    const utilisateurMatch = path.match(/^\/api\/utilisateurs\/(\d+)$/);
    if (req.method === 'GET' && utilisateurMatch) {
      if (!session) return sendJson(req, res, 401, { error: 'Connexion admin requise.' });
      const id = Number(utilisateurMatch[1]);
      const user = await prisma.utilisateur.findUnique({ where: { id } });
      if (!user) return sendJson(req, res, 404, { error: 'Utilisateur introuvable' });
      return sendJson(req, res, 200, user);
    }

    if (req.method === 'GET' && path === '/api/foods') {
      const foods = await prisma.food.findMany({ orderBy: { id: 'asc' } });
      return sendJson(req, res, 200, foods);
    }

    if (req.method === 'GET' && path === '/api/exercises') {
      const exercises = await prisma.exercise.findMany({ orderBy: { id: 'asc' } });
      return sendJson(req, res, 200, exercises);
    }

    if (req.method === 'GET' && path === '/api/allergies') {
      const allergies = await prisma.allergy.findMany({ orderBy: { id: 'asc' } });
      return sendJson(req, res, 200, allergies);
    }

    if (req.method === 'GET' && path === '/api/restrictions') {
      const restrictions = await prisma.dietaryRestriction.findMany({ orderBy: { id: 'asc' } });
      return sendJson(req, res, 200, restrictions);
    }

    if (req.method === 'GET' && path === '/api/nutrition/analytics') {
      if (!session && !enterpriseSession) return sendJson(req, res, 401, { error: 'Connexion requise.' });
      const analytics = await buildNutritionAnalyticsData();
      return sendJson(req, res, 200, analytics);
    }

    if (req.method === 'GET' && path === '/api/data') {
      if (!session) return sendJson(req, res, 401, { error: 'Connexion admin requise.' });
      const [utilisateurs, foods, exercises, allergies, restrictions] = await Promise.all([
        prisma.utilisateur.findMany({ orderBy: { id: 'asc' } }),
        prisma.food.findMany({ orderBy: { id: 'asc' } }),
        prisma.exercise.findMany({ orderBy: { id: 'asc' } }),
        prisma.allergy.findMany({ orderBy: { id: 'asc' } }),
        prisma.dietaryRestriction.findMany({ orderBy: { id: 'asc' } }),
      ]);

      return sendJson(req, res, 200, {
        utilisateurs,
        foods,
        exercises,
        allergies,
        restrictions,
      });
    }

    if (req.method === 'GET' && path === '/api/enterprise/users') {
      if (!enterpriseSession) return sendJson(req, res, 401, { error: 'Connexion entreprise requise.' });
      const enterprise = await getEnterpriseBySession(enterpriseSession);
      if (!enterprise) return sendJson(req, res, 401, { error: 'Session entreprise expirée.' });
      const users = await getScopedEnterpriseUsers(enterprise.id);
      return sendJson(req, res, 200, users.map(toUserResponse));
    }

    const enterpriseUserMatch = path.match(/^\/api\/enterprise\/users\/(\d+)$/);
    if (req.method === 'GET' && enterpriseUserMatch) {
      if (!enterpriseSession) return sendJson(req, res, 401, { error: 'Connexion entreprise requise.' });
      const enterprise = await getEnterpriseBySession(enterpriseSession);
      if (!enterprise) return sendJson(req, res, 401, { error: 'Session entreprise expirée.' });
      const id = Number(enterpriseUserMatch[1]);
      const user = await prisma.utilisateur.findFirst({
        where: { id, enterprise_id: enterprise.id },
      });
      if (!user) return sendJson(req, res, 404, { error: 'Utilisateur introuvable' });
      return sendJson(req, res, 200, toUserResponse(user));
    }

    if (req.method === 'GET' && path === '/api/enterprise/recommendations') {
      if (!enterpriseSession) return sendJson(req, res, 401, { error: 'Connexion entreprise requise.' });
      const enterprise = await getEnterpriseBySession(enterpriseSession);
      if (!enterprise) return sendJson(req, res, 401, { error: 'Session entreprise expirée.' });

      const type = url.searchParams.get('type') || undefined;
      const q = url.searchParams.get('q') || undefined;
      const periodDays = url.searchParams.get('periodDays') || undefined;
      const from = url.searchParams.get('from') || undefined;
      const to = url.searchParams.get('to') || undefined;
      const dedupe = parseBooleanParam(url.searchParams.get('dedupe'));

      const where = buildRecommendationsWhereFromQuery({
        type,
        q,
        periodDays,
        from,
        to,
        forceEnterpriseId: enterprise.id,
      });

      let recommendations = await prisma.recommendation.findMany({
        where,
        include: { user: { include: { enterprise: true } } },
        orderBy: { created_at: 'desc' },
      });

      if (dedupe) {
        recommendations = dedupeRecommendationsForPortfolio(recommendations);
      }
      const mapped = await Promise.all(recommendations.map(toRecommendationResponseAsync));
      return sendJson(req, res, 200, mapped);
    }

    const enterpriseRecommendationMatch = path.match(/^\/api\/enterprise\/recommendations\/(\d+)$/);
    if (req.method === 'GET' && enterpriseRecommendationMatch) {
      if (!enterpriseSession) return sendJson(req, res, 401, { error: 'Connexion entreprise requise.' });
      const enterprise = await getEnterpriseBySession(enterpriseSession);
      if (!enterprise) return sendJson(req, res, 401, { error: 'Session entreprise expirée.' });
      const id = Number(enterpriseRecommendationMatch[1]);
      const recommendation = await prisma.recommendation.findFirst({
        where: { id, user: { enterprise_id: enterprise.id } },
      });
      if (!recommendation) return sendJson(req, res, 404, { error: 'Recommandation introuvable' });
      return sendJson(req, res, 200, await toRecommendationResponseAsync(recommendation));
    }

    if (req.method === 'GET' && path === '/api/enterprise/dashboard') {
      if (!enterpriseSession) return sendJson(req, res, 401, { error: 'Connexion entreprise requise.' });
      const enterprise = await getEnterpriseBySession(enterpriseSession);
      if (!enterprise) return sendJson(req, res, 401, { error: 'Session entreprise expirée.' });
      const dashboard = await buildEnterpriseDashboardData(enterprise.id);
      return sendJson(req, res, 200, {
        ...dashboard,
        enterprise: serializeEnterprise(enterprise),
      });
    }

    if (req.method === 'GET' && path === '/api/enterprise/analytics') {
      if (!enterpriseSession) return sendJson(req, res, 401, { error: 'Connexion entreprise requise.' });
      const enterprise = await getEnterpriseBySession(enterpriseSession);
      if (!enterprise) return sendJson(req, res, 401, { error: 'Session entreprise expirée.' });
      const analytics = await buildEnterpriseAnalyticsData(enterprise.id);
      return sendJson(req, res, 200, {
        ...analytics,
        enterprise: serializeEnterprise(enterprise),
      });
    }

    if (req.method === 'GET' && path === '/api/recommendations') {
      if (!session) return sendJson(req, res, 401, { error: 'Connexion admin requise.' });

      const type = url.searchParams.get('type') || undefined;
      const q = url.searchParams.get('q') || undefined;
      const periodDays = url.searchParams.get('periodDays') || undefined;
      const from = url.searchParams.get('from') || undefined;
      const to = url.searchParams.get('to') || undefined;
      const enterpriseId = parseNumberParam(url.searchParams.get('enterpriseId'));
      const dedupe = parseBooleanParam(url.searchParams.get('dedupe'));

      const where = buildRecommendationsWhereFromQuery({
        type,
        q,
        periodDays,
        from,
        to,
        enterpriseId,
      });

      let recommendations = await prisma.recommendation.findMany({
        where,
        include: { user: { include: { enterprise: true } } },
        orderBy: { created_at: 'desc' },
      });

      if (dedupe) {
        recommendations = dedupeRecommendationsForPortfolio(recommendations);
      }
      const mapped = await Promise.all(recommendations.map(toRecommendationResponseAsync));
      return sendJson(req, res, 200, mapped);
    }

    const adminRecommendationMatch = path.match(/^\/api\/recommendations\/(\d+)$/);
    if (req.method === 'GET' && adminRecommendationMatch) {
      if (!session) return sendJson(req, res, 401, { error: 'Connexion admin requise.' });
      const id = Number(adminRecommendationMatch[1]);
      const recommendation = await prisma.recommendation.findUnique({ where: { id } });
      if (!recommendation) return sendJson(req, res, 404, { error: 'Recommandation introuvable' });
      return sendJson(req, res, 200, await toRecommendationResponseAsync(recommendation));
    }

    const buildGeneratedPrograms = (exercises) => {
      const list = (exercises ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        equipment: e.equipment ?? null,
        body_part: e.body_part ?? null,
        exercise_type: e.exercise_type ?? null,
      }));

      const wrapSlice = (items, startIndex, count) => {
        if (!items.length) return [];
        const out = [];
        for (let i = 0; i < count; i += 1) {
          out.push(items[(startIndex + i) % items.length]);
        }
        return out;
      };

      const includes = (value, needles) => {
        if (!value) return false;
        const s = String(value).toLowerCase();
        return needles.some((n) => s.includes(n));
      };

      const pickPool = (predicate, minCount) => {
        const filtered = predicate ? list.filter(predicate) : list;
        if (filtered.length >= (minCount ?? 1)) return filtered;
        return list;
      };

      const make = ({ id, name, description, level, duration, count, start, predicate }) => {
        const pool = pickPool(predicate, count);
        return {
          id,
          name,
          description,
          duration,
          level,
          exercises: wrapSlice(pool, start, count),
        };
      };

      return [
        make({
          id: 'p-fullbody-beginner',
          name: 'Full body · Starter',
          description: 'Programme généré à partir du catalogue d’exercices (sélection déterministe).',
          level: 'beginner',
          duration: 30,
          count: 8,
          start: 0,
        }),
        make({
          id: 'p-strength-intermediate',
          name: 'Strength · Intermediate',
          description: 'Programme généré (focus force / hypertrophie).',
          level: 'intermediate',
          duration: 45,
          count: 10,
          start: 12,
          predicate: (e) => includes(e.exercise_type, ['strength', 'power', 'resistance', 'weight']),
        }),
        make({
          id: 'p-upper-advanced',
          name: 'Upper body · Advanced',
          description: 'Programme généré (haut du corps, volume avancé).',
          level: 'advanced',
          duration: 55,
          count: 12,
          start: 28,
          predicate: (e) => includes(e.body_part, ['upper', 'chest', 'back', 'shoulder', 'arm', 'biceps', 'triceps']),
        }),
        make({
          id: 'p-lower-intermediate',
          name: 'Lower body · Intermediate',
          description: 'Programme généré (bas du corps).',
          level: 'intermediate',
          duration: 40,
          count: 10,
          start: 44,
          predicate: (e) => includes(e.body_part, ['lower', 'leg', 'glute', 'quad', 'hamstring', 'calf']),
        }),
        make({
          id: 'p-cardio-beginner',
          name: 'Cardio · Beginner',
          description: 'Programme généré (endurance / cardio).',
          level: 'beginner',
          duration: 25,
          count: 6,
          start: 8,
          predicate: (e) => includes(e.exercise_type, ['cardio', 'endurance', 'aerobic', 'hiit']),
        }),
        make({
          id: 'p-mobility-beginner',
          name: 'Mobility · Beginner',
          description: 'Programme généré (mobilité / stretching).',
          level: 'beginner',
          duration: 20,
          count: 6,
          start: 18,
          predicate: (e) => includes(e.exercise_type, ['mobility', 'stretch', 'yoga', 'flexibility']) || includes(e.body_part, ['core', 'back']),
        }),
      ].filter((p) => p.exercises.length);
    };

    if (req.method === 'GET' && path === '/api/programs') {
      const exercises = await prisma.exercise.findMany({ orderBy: { id: 'asc' } });
      const programs = buildGeneratedPrograms(exercises);
      return sendJson(req, res, 200, programs);
    }

    const programMatch = path.match(/^\/api\/programs\/(.+)$/);
    if (req.method === 'GET' && programMatch) {
      const programId = decodeURIComponent(String(programMatch[1] ?? '')).trim();
      const exercises = await prisma.exercise.findMany({ orderBy: { id: 'asc' } });
      const programs = buildGeneratedPrograms(exercises);
      const found = programs.find((p) => String(p.id) === programId);
      if (!found) return sendJson(req, res, 404, { error: 'Programme introuvable' });
      return sendJson(req, res, 200, found);
    }

    if (req.method === 'GET' && path === '/api/partners') {
      // Admin-only: expose enterprises as "partners" for the Partners UI.
      if (!session) return sendJson(req, res, 401, { error: 'Connexion requise.' });

      const enterprises = await prisma.enterprise.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const partners = enterprises.map((e) => {
        const usersManaged = Number(e?._count?.users ?? 0);
        const contractType = String(e.sector ?? 'Standard');
        const activity = String(e.sector ?? 'Entreprise');
        const performance = usersManaged >= 50 ? 'Excellent' : usersManaged >= 15 ? 'Très bon' : usersManaged >= 5 ? 'Bon' : 'Moyen';
        const createdAt = e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt);
        return {
          id: String(e.id),
          name: e.name,
          status: 'active',
          contractType,
          usersManaged,
          activity,
          performance,
          createdAt,
          updatedAt: createdAt,
        };
      });

      return sendJson(req, res, 200, partners);
    }

    const partnerMatch = path.match(/^\/api\/partners\/(.+)$/);
    if (req.method === 'GET' && partnerMatch) {
      if (!session) return sendJson(req, res, 401, { error: 'Connexion requise.' });

      const rawId = decodeURIComponent(partnerMatch[1]);
      const asNumber = Number(rawId);
      const enterprise = Number.isFinite(asNumber)
        ? await prisma.enterprise.findUnique({
            where: { id: asNumber },
            include: { _count: { select: { users: true } } },
          })
        : await prisma.enterprise.findUnique({
            where: { slug: rawId },
            include: { _count: { select: { users: true } } },
          });

      if (!enterprise) return sendJson(req, res, 404, { error: 'Partenaire introuvable' });

      const usersManaged = Number(enterprise?._count?.users ?? 0);
      const contractType = String(enterprise.sector ?? 'Standard');
      const activity = String(enterprise.sector ?? 'Entreprise');
      const performance = usersManaged >= 50 ? 'Excellent' : usersManaged >= 15 ? 'Très bon' : usersManaged >= 5 ? 'Bon' : 'Moyen';
      const createdAt = enterprise.createdAt instanceof Date ? enterprise.createdAt.toISOString() : String(enterprise.createdAt);
      return sendJson(req, res, 200, {
        id: String(enterprise.id),
        name: enterprise.name,
        status: 'active',
        contractType,
        usersManaged,
        activity,
        performance,
        createdAt,
        updatedAt: createdAt,
      });
    }

    if (req.method === 'GET' && path === '/api/settings') {
      const scope = getSettingsScope(session, enterpriseSession);
      if (!scope) return sendJson(req, res, 401, { error: 'Connexion requise.' });

      const key = `settings:${scope}`;
      const record = await prisma.appSetting.upsert({
        where: { key },
        update: {},
        create: { key, value: DEFAULT_SETTINGS },
      });

      const normalized = normalizeSettings(record?.value);
      if (JSON.stringify(record?.value) !== JSON.stringify(normalized)) {
        await prisma.appSetting.upsert({
          where: { key },
          update: { value: normalized },
          create: { key, value: normalized },
        });
      }

      return sendJson(req, res, 200, normalized);
    }

    if (req.method === 'PUT' && path === '/api/settings') {
      const scope = getSettingsScope(session, enterpriseSession);
      if (!scope) return sendJson(req, res, 401, { error: 'Connexion requise.' });

      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(req, res, 400, { error: 'JSON invalide.' });
      }

      if (!body || typeof body !== 'object') {
        return sendJson(req, res, 400, { error: 'Payload invalide.' });
      }

      const key = `settings:${scope}`;
      const existing = await prisma.appSetting.findUnique({ where: { key } });
      const base = existing?.value ?? DEFAULT_SETTINGS;
      const nextValue = mergeSettings(base, body);

      await prisma.appSetting.upsert({
        where: { key },
        update: { value: nextValue },
        create: { key, value: nextValue },
      });

      return sendJson(req, res, 200, nextValue);
    }

    if (req.method === 'POST' && path === '/api/recommendations') {
      // Generate & persist recommendations via external IA service.
      // Supports: diet, exercise, nutrition (or all).
      const scopeSession = session || enterpriseSession;
      if (!scopeSession) return sendJson(req, res, 401, { error: 'Connexion requise.' });

      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(req, res, 400, { error: 'JSON invalide.' });
      }

      const userId = Number(body?.userId ?? body?.user_id);
      if (!Number.isFinite(userId) || userId <= 0) {
        return sendJson(req, res, 400, { error: 'userId requis (number).' });
      }

      const kindRaw = String(body?.kind ?? body?.type ?? 'all').trim().toLowerCase();
      const kind = ['diet', 'exercise', 'nutrition', 'all'].includes(kindRaw) ? kindRaw : 'all';
      const allowPartial = body?.allowPartial !== false;

      if (enterpriseSession) {
        const enterprise = await getEnterpriseBySession(enterpriseSession);
        if (!enterprise) return sendJson(req, res, 401, { error: 'Session entreprise expirée.' });
        const user = await prisma.utilisateur.findFirst({ where: { id: userId, enterprise_id: enterprise.id } });
        if (!user) return sendJson(req, res, 404, { error: 'Utilisateur introuvable' });

        const created = [];
        const skipped = [];

        const createReco = async ({ recoType, referenceId, label }) => {
          const row = await prisma.recommendation.create({
            data: {
              user_id: user.id,
              type: recoType,
              reference_id: Number(referenceId ?? user.id),
              score: null,
              reason: `IA ${recoType}: ${label}`,
            },
          });
          created.push(toRecommendationResponse(row));
        };

        const doDiet = async () => {
          const iaPayload = buildDietIaPayloadFromUser(user);
          const iaResult = await postIaJson('/predict', iaPayload);
          const label = normalizeRecommendationLabel(iaResult?.recommendation);
          if (!label) throw new Error('Réponse IA invalide.');
          const confidence = Number(iaResult?.confidence);
          const row = await prisma.recommendation.create({
            data: {
              user_id: user.id,
              type: 'diet',
              reference_id: Number(user.id),
              score: Number.isFinite(confidence) ? confidence : null,
              reason: `IA diet: ${label}`,
            },
          });
          created.push(toRecommendationResponse(row));
        };

        const doExercise = async () => {
          const built = await buildExerciseIaPayload({ user, userId: user.id, overrides: body?.exercise });
          if (!built.ok) throw new Error(built.error);
          const iaResult = await postIaJson('/predict/exercise', built.payload);
          const label = normalizeRecommendationLabel(iaResult?.recommendation);
          if (!label) throw new Error('Réponse IA invalide.');
          const confidence = Number(iaResult?.confidence);
          const row = await prisma.recommendation.create({
            data: {
              user_id: user.id,
              type: 'exercise',
              reference_id: Number(built.referenceId ?? user.id),
              score: Number.isFinite(confidence) ? confidence : null,
              reason: `IA exercise: ${label}`,
            },
          });
          created.push(toRecommendationResponse(row));
        };

        const doNutrition = async () => {
          const built = await buildNutritionIaPayload({ userId: user.id, overrides: body?.nutrition });
          if (!built.ok) {
            if (!isNutritionInsufficientDataError(built.error)) throw new Error(built.error);
            const guess = guessMealLabelFromNow();
            const reason = `IA nutrition: ${guess}`;
            const row = await prisma.recommendation.create({
              data: {
                user_id: user.id,
                type: 'nutrition',
                reference_id: Number(user.id),
                score: null,
                reason,
              },
            });
            created.push(toRecommendationResponse(row));
            return;
          }
          const iaResult = await postIaJson('/predict/nutrition', built.payload);
          const label = normalizeRecommendationLabel(iaResult?.recommendation);
          if (!label) throw new Error('Réponse IA invalide.');
          const confidence = Number(iaResult?.confidence);
          const reason = `IA nutrition: ${label}`;
          const row = await prisma.recommendation.create({
            data: {
              user_id: user.id,
              type: 'nutrition',
              reference_id: Number(built.referenceId ?? user.id),
              score: Number.isFinite(confidence) ? confidence : null,
              reason,
            },
          });
          created.push(toRecommendationResponse(row));
        };

        const execOne = async (label, fn) => {
          try {
            await fn();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'unknown error';
            if (kind === 'all' && allowPartial) {
              skipped.push({ type: label, error: message });
            } else {
              throw err;
            }
          }
        };

        try {
          if (kind === 'diet' || kind === 'all') await execOne('diet', doDiet);
          if (kind === 'exercise' || kind === 'all') await execOne('exercise', doExercise);
          if (kind === 'nutrition' || kind === 'all') await execOne('nutrition', doNutrition);
        } catch (err) {
          return sendJson(req, res, 503, { error: `IA indisponible: ${err instanceof Error ? err.message : 'unknown error'}` });
        }

        if (kind !== 'all' && created.length === 1 && skipped.length === 0) {
          return sendJson(req, res, 201, created[0]);
        }

        return sendJson(req, res, 201, { created, skipped });
      }

      // Admin scope
      const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
      if (!user) return sendJson(req, res, 404, { error: 'Utilisateur introuvable' });

      const created = [];
      const skipped = [];

      const createReco = async ({ recoType, referenceId, label }) => {
        const row = await prisma.recommendation.create({
          data: {
            user_id: user.id,
            type: recoType,
            reference_id: Number(referenceId ?? user.id),
            score: null,
            reason: `IA ${recoType}: ${label}`,
          },
        });
        created.push(toRecommendationResponse(row));
      };

      const doDiet = async () => {
        const iaPayload = buildDietIaPayloadFromUser(user);
        const iaResult = await postIaJson('/predict', iaPayload);
        const label = normalizeRecommendationLabel(iaResult?.recommendation);
        if (!label) throw new Error('Réponse IA invalide.');
        const confidence = Number(iaResult?.confidence);
        const row = await prisma.recommendation.create({
          data: {
            user_id: user.id,
            type: 'diet',
            reference_id: Number(user.id),
            score: Number.isFinite(confidence) ? confidence : null,
            reason: `IA diet: ${label}`,
          },
        });
        created.push(toRecommendationResponse(row));
      };

      const doExercise = async () => {
        const built = await buildExerciseIaPayload({ user, userId: user.id, overrides: body?.exercise });
        if (!built.ok) throw new Error(built.error);
        const iaResult = await postIaJson('/predict/exercise', built.payload);
        const label = normalizeRecommendationLabel(iaResult?.recommendation);
        if (!label) throw new Error('Réponse IA invalide.');
        const confidence = Number(iaResult?.confidence);
        const row = await prisma.recommendation.create({
          data: {
            user_id: user.id,
            type: 'exercise',
            reference_id: Number(built.referenceId ?? user.id),
            score: Number.isFinite(confidence) ? confidence : null,
            reason: `IA exercise: ${label}`,
          },
        });
        created.push(toRecommendationResponse(row));
      };

      const doNutrition = async () => {
        const built = await buildNutritionIaPayload({ userId: user.id, overrides: body?.nutrition });
        if (!built.ok) {
          if (!isNutritionInsufficientDataError(built.error)) throw new Error(built.error);
          const guess = guessMealLabelFromNow();
          const reason = `IA nutrition: ${guess}`;
          const row = await prisma.recommendation.create({
            data: {
              user_id: user.id,
              type: 'nutrition',
              reference_id: Number(user.id),
              score: null,
              reason,
            },
          });
          created.push(toRecommendationResponse(row));
          return;
        }
        const iaResult = await postIaJson('/predict/nutrition', built.payload);
        const label = normalizeRecommendationLabel(iaResult?.recommendation);
        if (!label) throw new Error('Réponse IA invalide.');
        const confidence = Number(iaResult?.confidence);
        const reason = `IA nutrition: ${label}`;
        const row = await prisma.recommendation.create({
          data: {
            user_id: user.id,
            type: 'nutrition',
            reference_id: Number(built.referenceId ?? user.id),
            score: Number.isFinite(confidence) ? confidence : null,
            reason,
          },
        });
        created.push(toRecommendationResponse(row));
      };

      const execOne = async (label, fn) => {
        try {
          await fn();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'unknown error';
          if (kind === 'all' && allowPartial) {
            skipped.push({ type: label, error: message });
          } else {
            throw err;
          }
        }
      };

      try {
        if (kind === 'diet' || kind === 'all') await execOne('diet', doDiet);
        if (kind === 'exercise' || kind === 'all') await execOne('exercise', doExercise);
        if (kind === 'nutrition' || kind === 'all') await execOne('nutrition', doNutrition);
      } catch (err) {
        return sendJson(req, res, 503, { error: `IA indisponible: ${err instanceof Error ? err.message : 'unknown error'}` });
      }

      if (kind !== 'all' && created.length === 1 && skipped.length === 0) {
        return sendJson(req, res, 201, created[0]);
      }

      return sendJson(req, res, 201, { created, skipped });
    }

    if (req.method === 'POST' && path === '/api/recommendations/bulk') {
      // Generate recommendations for ALL users in scope.
      // Admin scope: every user. Enterprise scope: users belonging to the enterprise.
      const scopeSession = session || enterpriseSession;
      if (!scopeSession) return sendJson(req, res, 401, { error: 'Connexion requise.' });

      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(req, res, 400, { error: 'JSON invalide.' });
      }

      const kindRaw = String(body?.kind ?? body?.type ?? 'diet').trim().toLowerCase();
      const kind = ['diet', 'exercise', 'nutrition', 'all'].includes(kindRaw) ? kindRaw : 'diet';
      const allowPartial = body?.allowPartial !== false;

      let users = [];
      if (enterpriseSession) {
        const enterprise = await getEnterpriseBySession(enterpriseSession);
        if (!enterprise) return sendJson(req, res, 401, { error: 'Session entreprise expirée.' });
        users = await prisma.utilisateur.findMany({ where: { enterprise_id: enterprise.id } });
      } else {
        users = await prisma.utilisateur.findMany();
      }

      const usersCount = Array.isArray(users) ? users.length : 0;
      if (!usersCount) {
        return sendJson(req, res, 200, { usersCount: 0, createdCount: 0, skippedCount: 0, errors: [] });
      }

      let createdCount = 0;
      let skippedCount = 0;
      const errors = [];

      for (const user of users) {
        const created = [];
        const skipped = [];

        const createReco = async ({ recoType, referenceId, label }) => {
          await prisma.recommendation.create({
            data: {
              user_id: user.id,
              type: recoType,
              reference_id: Number(referenceId ?? user.id),
              score: null,
              reason: `IA ${recoType}: ${label}`,
            },
          });
          created.push({ type: recoType });
        };

        const doDiet = async () => {
          const iaPayload = buildDietIaPayloadFromUser(user);
          const iaResult = await postIaJson('/predict', iaPayload);
          const label = normalizeRecommendationLabel(iaResult?.recommendation);
          if (!label) throw new Error('Réponse IA invalide.');
          const confidence = Number(iaResult?.confidence);
          await prisma.recommendation.create({
            data: {
              user_id: user.id,
              type: 'diet',
              reference_id: Number(user.id),
              score: Number.isFinite(confidence) ? confidence : null,
              reason: `IA diet: ${label}`,
            },
          });
          created.push({ type: 'diet' });
        };

        const doExercise = async () => {
          const built = await buildExerciseIaPayload({ user, userId: user.id, overrides: body?.exercise });
          if (!built.ok) throw new Error(built.error);
          const iaResult = await postIaJson('/predict/exercise', built.payload);
          const label = normalizeRecommendationLabel(iaResult?.recommendation);
          if (!label) throw new Error('Réponse IA invalide.');
          const confidence = Number(iaResult?.confidence);
          await prisma.recommendation.create({
            data: {
              user_id: user.id,
              type: 'exercise',
              reference_id: Number(built.referenceId ?? user.id),
              score: Number.isFinite(confidence) ? confidence : null,
              reason: `IA exercise: ${label}`,
            },
          });
          created.push({ type: 'exercise' });
        };

        const doNutrition = async () => {
          const built = await buildNutritionIaPayload({ userId: user.id, overrides: body?.nutrition });
          if (!built.ok) {
            if (!isNutritionInsufficientDataError(built.error)) throw new Error(built.error);
            const guess = guessMealLabelFromNow();
            const reason = `IA nutrition: ${guess}`;
            await prisma.recommendation.create({
              data: {
                user_id: user.id,
                type: 'nutrition',
                reference_id: Number(user.id),
                score: null,
                reason,
              },
            });
            created.push({ type: 'nutrition' });
            return;
          }
          const iaResult = await postIaJson('/predict/nutrition', built.payload);
          const label = normalizeRecommendationLabel(iaResult?.recommendation);
          if (!label) throw new Error('Réponse IA invalide.');
          const confidence = Number(iaResult?.confidence);
          const reason = `IA nutrition: ${label}`;
          await prisma.recommendation.create({
            data: {
              user_id: user.id,
              type: 'nutrition',
              reference_id: Number(built.referenceId ?? user.id),
              score: Number.isFinite(confidence) ? confidence : null,
              reason,
            },
          });
          created.push({ type: 'nutrition' });
        };

        const execOne = async (label, fn) => {
          try {
            await fn();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'unknown error';
            if ((kind === 'all' || kind === label) && allowPartial) {
              skipped.push({ type: label, error: message });
            } else {
              throw err;
            }
          }
        };

        try {
          if (kind === 'diet' || kind === 'all') await execOne('diet', doDiet);
          if (kind === 'exercise' || kind === 'all') await execOne('exercise', doExercise);
          if (kind === 'nutrition' || kind === 'all') await execOne('nutrition', doNutrition);
        } catch (err) {
          // IA outages should abort quickly to avoid long-running partial writes.
          return sendJson(req, res, 503, { error: `IA indisponible: ${err instanceof Error ? err.message : 'unknown error'}` });
        }

        createdCount += created.length;
        skippedCount += skipped.length;

        if (skipped.length && errors.length < 50) {
          for (const item of skipped) {
            if (errors.length >= 50) break;
            errors.push({ userId: String(user.id), type: item.type, error: String(item.error ?? '') });
          }
        }
      }

      return sendJson(req, res, 200, { usersCount, createdCount, skippedCount, errors });
    }

    if (req.method === 'POST' && path === '/api/password/forgot') {
      return sendJson(req, res, 501, { error: 'Réinitialisation du mot de passe non implémentée côté API.' });
    }

    return sendJson(req, res, 404, { error: 'Not found' });
  } catch (err) {
    return sendJson(req, res, 500, { error: err instanceof Error ? err.message : 'Internal error' });
  }
});

if (prisma && String(process.env.SEED_ENTERPRISE_ACCOUNTS ?? '').trim().toLowerCase() === 'true') {
  await ensureEnterpriseBootstrap();
}

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${PORT}`);
});

process.on('SIGINT', async () => {
  if (prisma?.$disconnect) {
    await prisma.$disconnect();
  }
  process.exit(0);
});
process.on('SIGTERM', async () => {
  if (prisma?.$disconnect) {
    await prisma.$disconnect();
  }
  process.exit(0);
});
