import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import env from '../../env.ts'
import db from '../db/db.ts'
import { users } from '../db/schema.ts'
import type { NewUser } from '../db/schema.ts'
import { hashPassword, isPasswordValid } from '../utils/passwords.ts'
import { genereateToken } from '../utils/jwt.ts'
import { eq } from 'drizzle-orm'
export const register = async (
  req: Request<any, any, NewUser>,
  res: Response,
) => {
  try {
    const hashedPass = await hashPassword(req.body.password)

    const [user] = await db
      .insert(users)
      .values({
        ...req.body,
        password: hashedPass,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })

    const jwt = await genereateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    })

    return res.status(201).json({
      message: 'User has been created!',
      user,
      token: jwt,
    })
  } catch (e) {
    if(e.cause.constraint.includes('unique')) {
      return res.status(409).json({ error: 'Email or username already exists' })
    }
    if (e.cause) {
      return res.status(500).json({ error: e.cause.message })
    }
    console.error('Registration error') //e.cause?.code
    return res.status(500).json({ error: 'Failed to create user' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValid = await isPasswordValid(password, user.password)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const jwt = await genereateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    })

    return res.status(200).json({
      message: 'Successful login',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        lastName: user.lastName,
        firstName: user.firstName,
      },
      token: jwt,
    })
  } catch (e) {
    return res.status(500).json({ error: 'Server error' })
  }
}
