import db from '../../src/db/db.ts'
import { hashPassword } from '../../src/utils/passwords.ts'
import { genereateToken } from '../../src/utils/jwt.ts'
import { users, habits, habitTags, entries, tags, type NewUser, type NewHabit } from '../../src/db/schema.ts'
//TODO: create user and habit creation

export const createTestUser = async(userData?: Partial<NewUser>) => {
    const id = crypto.randomUUID()
    const defaultUser = {
        username: `user-${id}`,
        email: `email-${id}@example.com`,
        password: 'test1234',
        firstName: 'Peter',
        lastName: 'Whisper',
        ...userData
    }

    const hashedPassword = await hashPassword(defaultUser.password)

    const [user] = await db.insert(users).values({
        ...defaultUser,
        password: hashedPassword
    }).returning()

    const token = await genereateToken({
        id: user.id,
        username: user.username,
        email: user.email,
      
    })

    return {
        token,
        user,
        rawPassword: defaultUser.password
    }

}

export const createTestHabit = async(userId: string, habitData: Partial<NewHabit>) => {
    const id = crypto.randomUUID()
    const defaultHabit = {
        name: `habit-${id}`,
        description: `blablabla-${id} description`,
        frequency: 'weekly' as const,
        targetCount: 6,
        ...habitData
    }
 
    const [habit] = await db.insert(habits).values({
        ...defaultHabit,
         userId,
    }).returning()

  
 return habit

}

export const wipeDbTables = async() => {
    await db.delete(entries)
    await db.delete(tags)
    await db.delete(habitTags)
    await db.delete(habits)
    await db.delete(users)
}