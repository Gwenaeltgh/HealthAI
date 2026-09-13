import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUserById(userId: number, options?: any) {
    return await prisma.utilisateur.findUnique({
        where: { id: userId },
        include: {
        meals: options?.food ? {
            include: {
            foods: {
                include: { food: true }
            }
            }
        } : false,

        restrictions: options?.restriction ? {
            include: { restriction: true }
        } : false,

        allergies: options?.allergy ? {
            include: { allergy: true }
        } : false,

        userExercises: options?.exercise ? {
            include: { exercise: true }
        } : false
        }
    })
}