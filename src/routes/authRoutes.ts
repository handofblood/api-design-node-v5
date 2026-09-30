import { Router } from 'express'
import { register, login } from '../controllers/authController.ts';
import { validateBody } from '../middleware/validation.ts';
import { insertUserSchema } from '../db/schema.ts';
import { loginSchema } from '../validators/auth.ts'
const router = Router(); 

router.post('/register', validateBody(insertUserSchema), register)

router.post('/login', validateBody(loginSchema), login)

export default router