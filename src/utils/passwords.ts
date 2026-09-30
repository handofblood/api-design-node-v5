import bcrypt from 'bcrypt'
import env from './../../env.ts'

export const hashPassword = async (password: string) => {
    return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS)
}

export const isPasswordValid = async (password: string, hashedPassword: string) => {
    return bcrypt.compare(password, hashedPassword)
} 