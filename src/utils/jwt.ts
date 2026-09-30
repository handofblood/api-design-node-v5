import { jwtVerify, SignJWT } from "jose";
import { createSecretKey } from "crypto";
import env from '../../env.ts'

export interface JwtPayload {
    id: string
    email: string
    username: string
}

export const genereateToken = (payload: JwtPayload) => {
 

    return new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(getSecretKey())
}

export const verifyToken = async (token: string): Promise<JwtPayload> => {
    const { payload }  = await jwtVerify<JwtPayload>(token, getSecretKey)
    return payload   
}
function getSecretKey () {
    return createSecretKey(env.JWT_SECRET, 'utf-8')
}