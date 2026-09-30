import type { AuthentificatedRequest } from '../middleware/auth.ts'
import type { NextFunction, Response } from 'express'
import db from '../db/db.ts'
import { createHabitSchema } from '../validators/habits.ts'
import { entries, habits, habitTags, type FrequencyEnum } from '../db/schema.ts'
import { eq, desc, and } from 'drizzle-orm'
import { ApiError } from '../middleware/errors.ts'

export const createHabit = async (
  req: AuthentificatedRequest,
  res: Response,
) => {
  try {
    const { name, description, frequency, targetCount, tagIds } =
      createHabitSchema.parse(req.body)

    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId: req.user.id,
          name,
          description,
          frequency: frequency as FrequencyEnum,
          targetCount,
        })
        .returning()

      if (tagIds && tagIds.length > 0) {
        const newHabitTags = tagIds.map((tagId) => ({
          habitId: newHabit.id,
          tagId,
        }))

        await tx.insert(habitTags).values(newHabitTags)
      }

      return newHabit
    })

    res.status(201).json({
      message: 'Habit has been created!',
      habit: result,
    })
  } catch (e) {
    res
      .status(500)
      .json({ error: 'Server error', message: 'Failed to create habit', e })
  }
}

export const updateHabit = async (
  req: AuthentificatedRequest,
  res: Response,
) => {
  const id = req.params.id
  const { tagIds, ...updates } = req.body
  const result = await db.transaction(async (tx) => {
    const [updatedHabit] = await tx
      .update(habits)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(habits.id, id), eq(habits.userId, req.user.id)))
      .returning()

    if (!updatedHabit) {
      return res.status(404).json({ message: 'Not found' })
    }

    if (tagIds && tagIds.length > 0) {
      await tx.delete(habitTags).where(eq(habitTags.habitId, id))

      const newHabitTags = tagIds.map((tagId) => ({
        habitId: updatedHabit.id,
        tagId,
      }))

      await tx.insert(habitTags).values(newHabitTags)
      return updatedHabit
    }
  })

  res.status(200).json({message: 'Habit sucessfully updated', habit: result})
  try {
  } catch (e) {
    res.status(500).json({ e })
  }
}

export const completeHabit = async (
  req: AuthentificatedRequest,
  res: Response,
) => {
  try {
    const id = req.params.id
    const {note} = req.body
    
    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, req.user.id))
    })

    if(!habit) {
      return res.status(401).end()
    }

    const entry = await db.insert(entries).values({habitId: id, completionDate: new Date(), note}).returning()

    res.status(200).json({ message: 'Entry created!', entry })
  } catch (e) {
    res
      .status(500)
      .json({ error: 'Server error', message: 'Failed to complete habit', e })
  }
}

export const getUserHabitById = async (
  req: AuthentificatedRequest,
  res: Response,
) => {
  try {
    const id = req.params.id

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, req.user.id)),
      with: {
        habitTags: {
          with: {
            tag: true
          }
        },
        entries: {
          limit: 10,
          orderBy: desc(entries.createdAt)
        }
      }
    })

    if(!habit) {
      return res.status(404).json({message: 'Not found'})
    }

    const flatHabit = {
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }

    res.status(200).json({habit: flatHabit})

  } catch (e) {
     res.status(500).json({ e })
  }
}

export const getUserHabits = async (
  req: AuthentificatedRequest,
  res: Response,
) => {
  try {
    // const userHabits = (await db.select().from(habits).where(eq(habits.userId, req.user.id)))

    const userHabits = await db.query.habits.findMany({
      where: eq(habits.userId, req.user.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    })

    const flatHabits = userHabits.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }))

    return res.status(200).json({ habits: flatHabits })
  } catch (e) {
    res.status(500).json({ e })
  }
}

export const delteHabit = async (
  req: AuthentificatedRequest,
  res: Response,
  next: NextFunction
) => {
    const id = req.params.id

    const [deletedHabit] = await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, req.user.id))).returning()

    if(!deletedHabit) {
     return next(new ApiError('not_found'))
    }
     
    res.status(200).json({message: 'Sucessfully deleted!', habit: deletedHabit})
}
