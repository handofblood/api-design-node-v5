import type { Response, Request, NextFunction } from "express";
import {z} from 'zod'
 

export const validateBody = <T extends z.ZodType>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.body)
            const validatedBody = schema.parse(req.body)
            req.body = validatedBody
            next()
        } catch(e) {
            if(e instanceof z.ZodError) {
              getValidationError(res, e)
            }
            next(e)
        }
    }
}

export const validateParams = <T extends z.ZodType>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
             schema.parse(req.params)
            next()
        } catch(e) {
            if(e instanceof z.ZodError) {
              getValidationError(res, e, 'Invalid params')
            }
            next(e)
        }
    }
}


export const validateQuery = <T extends z.ZodType>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.query)
            next()
        } catch(e) {
            if(e instanceof z.ZodError) {
              return getValidationError(res, e, 'Invalid query')
            }
            next(e)
        }
    }
}

function getValidationError (res: Response, e: z.ZodError, message = 'Validation failed') {
     return res.status(400).json({
        error: message,
        details: e.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }))
    })
}

