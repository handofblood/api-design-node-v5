import type { Response, Request, NextFunction } from "express"

const ERROR_NAMES = {
    
    'error': {message: 'Server error', status: 500},
    'fields_validation': {message: 'Fields Validation error', status: 400},
    'access': {message: 'Forbiden access', status: 403},
    'not_found': {message: 'Not found', status: 404}
}

export class ApiError extends Error {
  name: string;
  info?: string;
  status?: number;
  details?: string;  
    constructor(name: string, info?: string, status?: number, details?: string) {
      super()
      this.name = name;
      this.info = info;
      this.status = status;
      this.details = details  
    }
}


export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction ) => {

    let name = err.name || 'default'
    let message = err.info || ERROR_NAMES[name].message
    let status = err.status || ERROR_NAMES[name].status
    let details = err.details || undefined
    return res.status(status).json({
        error: message,
        details
    })

}

 