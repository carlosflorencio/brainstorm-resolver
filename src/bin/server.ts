import * as log4js from 'log4js'
import config from '../config/config'

/**
 * Default log4js global configuration
 * info is the default log level
 */
log4js.configure({
  appenders: {
    stdout: { type: 'stdout' }
  },
  categories: {
    default: { appenders: ['stdout'], level: 'info' }
  }
})

const log = log4js.getLogger('Server')

/**
 * Start Express server
 */
const port = process.env.PORT || 3000

import app from '../ExpressApp'
app.listen(port, () => {
  log.info(
    config.name + ' is running at http://localhost:%d in %s mode',
    port,
    app.get('env')
  )
  log.info('Press CTRL-C to stop\n')
})
