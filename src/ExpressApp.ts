import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as log4js from 'log4js'
import {
  errorHandler,
  notFoundHandler,
  utilsHandler
} from './helpers/middlewares'

/**
 * Controllers (route handlers).
 */
import homeController from './controllers/home'
import botAuto from './controllers/botAutoAnswer'

/**
 * log4js Logger
 */
const logger = log4js.getLogger('Express')

/**
 * Create Express server.
 */
const app = express()

/**
 * Express configuration.
 */
app.use(log4js.connectLogger(logger, { level: 'auto' }))
app.use(bodyParser.json())
app.use(utilsHandler)
app.use(bodyParser.urlencoded({ extended: true }))

/**
 * Primary app routes.
 */
app.use('/', homeController)
app.use('/bot', botAuto)

/**
 * Catch 404
 */
app.use(notFoundHandler)

/**
 * Last error handler
 */
app.use(errorHandler)

export default app
