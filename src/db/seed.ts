import { users, tags, entries, habitTags, habits } from "./schema.ts";
import db from "./db.ts";
import { randomFromArr, getRandomInt } from "../utils/math.ts"; 

const firstNamesSeedData = [
  "James", "Emma", "Liam", "Olivia", "Noah",
  "Ava", "Ethan", "Sophia", "Lucas", "Mia",
  "Mason", "Isabella", "Logan", "Charlotte", "Oliver",
  "Amelia", "Elijah", "Harper", "Benjamin", "Evelyn"
];

const lastNamesSeedData = [
  "Smith", "Johnson", "Williams", "Brown", "Jones",
  "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Wilson", "Anderson", "Taylor", "Thomas", "Moore",
  "Jackson", "Martin", "Lee", "Thompson", "White"
];

const usernamesSeedData = [
  "user123", "coolcat", "skywalker", "pixelpro", "techguru",
  "nightowl", "sunnyday", "gamer42", "bluefox", "codeninja",
  "starlight", "quickstep", "moonrider", "happyhippo", "silverwolf",
  "dreamer01", "rocketman", "greenleaf", "stormchaser", "lazypanda"
];

const habitsSeedData = [
  "Drink 8 glasses of water", "Exercise for 30 minutes", "Read for 20 minutes", "Meditate", "Sleep 8 hours",
  "Journal", "Walk 10,000 steps", "Eat a healthy breakfast", "Stretch", "No social media before noon",
  "Practice gratitude", "Learn a new word", "Take vitamins", "Floss", "Plan tomorrow",
  "Limit screen time", "Cook at home", "Call a friend or family member", "Tidy up for 10 minutes", "Go to bed by 11 PM"
];
const tagsSeedData = [
  "health", "fitness", "mindfulness", "productivity", "learning",
  "nutrition", "sleep", "social", "self-care", "finance",
  "morning", "evening", "daily", "weekly", "hydration",
  "creativity", "reading", "wellness", "home", "career"
];

const colorsSeedData = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16",
  "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF",
  "#EC4899", "#F43F5E", "#64748B", "#78716C", "#0F172A"
];



const seed = async () => {
    console.log('Start seeding ...')

    try {
        console.log('Clearing db tables...')
        
        await db.delete(users)
        await db.delete(tags)
        await db.delete(entries)
        await db.delete(habits)
        await db.delete(habitTags)

        console.log('Creating users...')

        let usersArr = []
        for(let i = 0; i<20; i++) {
            const username = `${randomFromArr(usernamesSeedData)}${i}`
            const firstName = randomFromArr(firstNamesSeedData)
            const lastName = randomFromArr(lastNamesSeedData)
            const email = `${firstName}-${lastName}-${i}@mail.com`
            usersArr.push({
                username,
                email,
                password: 'generic123',
                firstName,
                lastName,
            })  
        }

        console.log('Creating habits...')

        const allUsers = await db.insert(users).values(usersArr).returning()

          for( const user of allUsers) {
            const habitCount = getRandomInt(1, 5)
            let habitsArr = []
            for(let i = 0; i<habitCount; i++) {
                const name = randomFromArr(habitsSeedData)
                habitsArr.push({
                    userId: user.id,
                    name,
                    description: `This is habit ${name} for ${user.username}`,
                    frequency: 'daily',
                    targetCount: getRandomInt(1, 10),
                })
            }
            const allHabits = await db.insert(habits).values(habitsArr).returning()
            
            let entriesArr = []
            let tagsArr = []
            allHabits.forEach(async (habit) => {
                entriesArr.push({
                    habitId: habit.id,
                    note: 'Finaly done it once'
                })
            
                 tagsArr.push({
                    name: randomFromArr(tagsSeedData),
                    color: randomFromArr(colorsSeedData)
                })
            })

            await db.insert(entries).values(entriesArr)

           const allTags = await db.insert(tags).values(tagsArr).returning()

           let habitTagsArr = []
            allTags.forEach(async (tag, i)=> {
                habitTagsArr.push({
                    tagId: tag.id,
                    habitId: allHabits[i].id
                })
            })

            await db.insert(habitTags).values(habitTagsArr)

        }

        console.log('Seeding completed.')
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
}

if(import.meta.url === `file://${process.argv[1]}`) {
    seed()
    .then(() => process[0])
}

export default seed