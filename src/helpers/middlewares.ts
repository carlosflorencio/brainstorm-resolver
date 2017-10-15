import * as log4js from 'log4js'
import { NextFunction, Response, Request } from 'express'
const logger = log4js.getLogger('Middleware')

/**
 * Add some useful methods to req and res objects
 */
export const utilsHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.sendError = (err: string, statusCode: number = 400) => {
    return res.status(statusCode).send({ error: err })
  }

  res.sendNotFound = (err: string = 'No results for that request.') => {
    return res.status(404).send({ error: err })
  }

  res.createdAt = (path: string) => {
    res.setHeader('Location', path)
    return res.status(201).end()
  }

  return next()
}

/**
 * Not found handler
 */
export const notFoundHandler = (req, res) => {
  res.sendError('That endpoint does not exist.', 404)
}

/**
 * Error handler
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Error middleware', err)

  res.sendError('Houston, we have a problem!', 500)
}

/**
 * Verify if body has these fields
 *
 * @param fields
 * @returns {(req, res, next) => void}
 */
export const requiredFields = (...fields) => {
  return (req, res, next) => {
    for (let field of fields) {
      if (!req.body[field]) {
        return res.sendError(`${field} is required.`)
      }
    }

    next()
  }
}
