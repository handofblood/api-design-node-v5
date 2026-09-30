import type { Request, Response, NextFunction } from "express"
import { verifyToken, type JwtPayload } from '../utils/jwt.ts'

export interface AuthentificatedRequest extends Request {
    user?: JwtPayload
}

export const authenticateToken = async(req: AuthentificatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
        if(!token) {
            return res.status(401).json({error: 'Unauthorized'})
        }
        const payload = await verifyToken(token)

        req.user = payload
        next()
        } catch(e) {
            return res.status(500).json({error: 'Server error'})
        }
    }
