import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts';
import {z} from 'zod'
import { authenticateToken } from '../middleware/auth.ts';
import {createHabit, getUserHabits, updateHabit, delteHabit, getUserHabitById, completeHabit} from '../controllers/habitController.ts'
import {createHabitSchema, updateHabitSchema} from '../validators/habits.ts'
 import { uuidSchema } from '../validators/common.ts'

const router = Router(); 

router.use(authenticateToken)

router.get('/', getUserHabits)

router.post('/', validateBody(createHabitSchema), createHabit)

router.get('/:id', validateParams(uuidSchema), getUserHabitById)

router.post('/:id/complete', validateParams(uuidSchema), completeHabit)

router.patch('/:id', validateParams(uuidSchema), validateBody(updateHabitSchema), updateHabit)

router.delete('/:id',validateParams(uuidSchema), delteHabit)

export default router