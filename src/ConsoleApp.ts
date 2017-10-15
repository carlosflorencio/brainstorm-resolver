import * as boxen from 'boxen'
import config from './config/config'
import {
  AutoAnswersMode,
  END,
  LIVE,
  QUESTION,
  STARTING,
  STOP
} from './modes/AutoAnswersMode'
import {
  notifyEnd,
  notifyLive,
  notifyQuestion,
  notifyStart,
  notifyStop
} from './modes/MyDevicesSubscribers'

console.log(boxen(config.name + ' v' + config.version))

const automatic = new AutoAnswersMode()
const emitter = automatic.subscribe()

emitter.on(STARTING, notifyStart)
emitter.on(LIVE, notifyLive)
emitter.on(QUESTION, notifyQuestion)
emitter.on(END, notifyEnd)
emitter.on(STOP, notifyStop)

automatic
  .start()
  .then(_ => {
    console.log('Shutting down, good bye.')
  })
  .catch(e => {
    console.error('Houston we have a problem!', e)
  })
