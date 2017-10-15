import { Router } from 'express'
import config from '../config/config'
import Bot from '../services/MessengerBot'
import Pushover from '../services/Pushover'
import {
  AutoAnswersMode,
  BrainEmitter,
  LIVE,
  STARTING,
  QUESTION,
  END
} from '../modes/AutoAnswersMode'
import { IQuestion, rightAnswer } from '../storm/IQuestion'
import * as util from 'util'
import IBotUser from './IBotUser'
import BrainstormService from '../storm/BrainstormService'
import { sleep } from '../helpers/Utils'
const router = Router()

const me = '1548358141894785' // admin facebook id

// Allowed facebook profiles to register
// Each user can have multiple accounts
// Each account will have the 6 questions answered when the show goes live
const users: { [id: string]: IBotUser } = {
  [me]: {
    name: 'John Doe',
    accounts: {
      100547: 'johndoe@gmail.com', // account id - registered email
      100548: 'johndoe2@gmail.com'
    }
  },
  '1890760770978945': {
    name: 'Alice',
    accounts: {
        100549: 'alice@gmail.com'
    }
  },
  '15116639355458723': {
    name: 'Bob',
    accounts: {
        100550: 'bob@gmail.com'
    }
  }
}

let brainService: AutoAnswersMode = new AutoAnswersMode()
let emitter: BrainEmitter = brainService.subscribe()

const POSTBACK_REGISTER = 'POSTBACK_REGISTER'
const POSTBACK_UNREGISTER = 'POSTBACK_UNREGISTER'
const POSTBACK_ACCOUNTS = 'POSTBACK_ACCOUNTS'
const POSTBACK_STATUS = 'POSTBACK_STATUS'
const POSTBACK_START = 'POSTBACK_START'
const POSTBACK_STOP = 'POSTBACK_STOP'
const POSTBACK_USERS = 'POSTBACK_USERS'
const POSTBACK_TESTING = 'POSTBACK_TESTING'

const bot = new Bot({
  token: config.bot.page_token,
  verify: config.bot.verify,
  app_secret: config.bot.app_secret
})

const botEvents = bot.subscribe()

botEvents.on('error', err => {
  console.log(err.message)
})

botEvents.on('message', async payload => {
  try {
    const senderId = payload.sender.id

    await bot.sendMessage(senderId, {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'What do you want to do?',
          buttons: [
            {
              type: 'postback',
              title: 'Status',
              payload: POSTBACK_STATUS
            }
          ]
        }
      }
    })
  } catch (error) {
    notifyError('Failed to process the message!', error)
  }
})

botEvents.on('postback', payload => {
  try {
    const type = payload.postback.payload
    const senderId = payload.sender.id

    switch (type) {
      case POSTBACK_REGISTER:
        handleRegister(senderId)
        break
      case POSTBACK_UNREGISTER:
        handleUnRegister(senderId)
        break
      case POSTBACK_STATUS:
        handleStatus(senderId)
        break
      case POSTBACK_START:
        handleStart(senderId)
        break
      case POSTBACK_STOP:
        handleStop(senderId)
        break
      case POSTBACK_USERS:
        handleUsers(senderId)
        break
      case POSTBACK_TESTING:
        handleTesting(senderId)
        break
      case POSTBACK_ACCOUNTS:
        handleAccounts(senderId)
        break
    }
  } catch (error) {
    notifyError('Failed to process the postback!', error)
  }
})

async function handleRegister(senderId) {
  if (!isRegistered(senderId)) {
    const profile = await bot.getProfile(senderId)
    const name = profile.first_name + ' ' + profile.last_name

    bot.sendMessage(senderId, {
      text:
        'The admin will review your request.\nWhen accepted, you will receive here the results for each game day. :p'
    })

    Pushover.send('New registration!', name + ' ID: ' + senderId)
    return
  }

  bot.sendMessage(senderId, {
    text:
      'You are already registered! I will answer the questions for you, just sit down and relax. :)'
  })
}

function handleUnRegister(senderId) {
  if (isRegistered(senderId)) {
    if (isAdmin(senderId)) {
      bot.sendMessage(senderId, {
        text: 'You are admin, you cannot unregister.'
      })
      return
    }

    bot.sendMessage(senderId, {
      text: 'The admin will review your unregister request. Good bye.'
    })

    Pushover.send('Unregister!', users[senderId].name + ' ID: ' + senderId)
    return
  }

  bot.sendMessage(senderId, {
    text: 'You are not registered yet.'
  })
}

function handleStatus(senderId) {
  let msg = ''

  if (isAdmin(senderId)) {
    msg += brainService.getIsTesting()
      ? 'Testing is ON.\n\n'
      : 'Testing is OFF.\n\n'
  }

  if (!isRegistered(senderId)) {
    msg += 'Only registered users will receive the answers. Register now.\n\n'
  }

  if (!brainService.getIsRunning()) {
    msg += "I'm not started yet. Wait for the show to be live."

    bot.sendMessage(senderId, {
      text: msg
    })
    return
  }

  const questions = brainService.getQuestions()
  const isLive = brainService.getIsLive()
  const qRequests = brainService.getQuestionsRequests()
  const lRequests = brainService.getLiveRequests()

  if (isAdmin(senderId)) {
    msg += adminInfo(qRequests, lRequests) + '\n\n'
  }

  if (!isLive) {
    msg += 'I am awaiting for the show to be live. Get ready! :p'
    bot.sendMessage(senderId, {
      text: msg
    })
    return
  }

  msg +=
    'The show is live.\nAwaiting for more questions.\n\nCurrent question: ' +
    questions.length +
    ' of 6.'

  bot.sendMessage(senderId, {
    text: msg
  })
  return
}

function handleStart(senderId) {
  if (!isAdmin(senderId)) {
    bot.sendMessage(senderId, {
      text: 'Only the admin can invoke this command.'
    })

    return
  }

  if (!brainService.getIsRunning()) {
    brainService.start()

    bot.sendMessage(senderId, {
      text: 'Starting the program!'
    })
  } else {
    bot.sendMessage(senderId, {
      text: 'The program is alread started.'
    })
  }
}

function handleStop(senderId) {
  if (!isAdmin(senderId)) {
    bot.sendMessage(senderId, {
      text: 'Only the admin can invoke this command.'
    })

    return
  }

  if (!brainService.getIsRunning()) {
    bot.sendMessage(senderId, {
      text: 'The program is not running.'
    })
  } else {
    brainService.stop()

    bot.sendMessage(senderId, {
      text: 'The program will stop.'
    })
  }
}

function handleUsers(senderId) {
  if (!isAdmin(senderId)) {
    bot.sendMessage(senderId, {
      text: 'Only the admin can invoke this command.'
    })

    return
  }

  let msg = 'Registered users\n'
  msg +=
    'Users: ' +
    Object.keys(users).length +
    ' Accounts: ' +
    totalAccounts() +
    '\n\n'

  for (let id in users) {
    msg +=
      ' - ' +
      users[id].name +
      ' (' +
      Object.keys(users[id].accounts).length +
      ')\n'
  }

  bot.sendMessage(senderId, {
    text: msg
  })
}

function handleTesting(senderId) {
  if (!isAdmin(senderId)) {
    bot.sendMessage(senderId, {
      text: 'Only the admin can invoke this command.'
    })

    return
  }

  let msg = ''
  if (brainService.getIsTesting()) {
    msg = 'Testing is now OFF.'
    brainService.setTesting(false)
  } else {
    msg = 'Testing is now ON.'
    brainService.setTesting(true)
  }

  bot.sendMessage(senderId, {
    text: msg
  })
}

function handleAccounts(senderId) {
  if (!isRegistered(senderId)) {
    bot.sendMessage(senderId, {
      text: 'You are not registered.'
    })

    return
  }

  let msg = 'Your accounts: \n\n'

  for (let id in getUserAccounts(senderId)) {
    msg += users[senderId].accounts[id] + '\n'
  }

  bot.sendMessage(senderId, {
    text: msg
  })
}

/*
|--------------------------------------------------------------------------
| Service events
|--------------------------------------------------------------------------
*/
emitter.on(STARTING, () => {
  const msg = 'Starting and awaiting for the show to be live!'

  notifyAll(msg)
  console.log(msg)
})

emitter.on(LIVE, () => {
  const msg =
    'Brainstorm is live!\n\nI will answer the questions for your accounts.'

  notifyAll(msg)
  console.log(msg)
})

emitter.on(QUESTION, (question: IQuestion, count: number) => {
  const answer = rightAnswer(question)
  const msg = util.format(
    'Answer: %s\n\n%s\n\nQuestion: %s\n\nTotal: %d/6',
    answer,
    question['option' + question.right],
    question.text,
    count
  )

  if (!brainService.getIsTesting()) {
    let answered = 0
    for (let userId in users) {
      for (let accountId in users[userId].accounts) {
        BrainstormService.submitAnswer(
          parseInt(accountId),
          question.id,
          question.right
        )
        answered++
      }
    }
    bot.sendMessage(me, {
      text: 'Auto answered ' + answered + ' accounts.'
    })
  }

  notifyAll(msg)
  console.log(msg)
})

emitter.on(END, async (questionsRequests: number, liveRequests: number) => {
  await sleep(2000)

  if (!brainService.getIsTesting()) {
    for (let userId in users) {
      let msg = 'Finished for today!\n\nQuestions answered:\n'

      for (let accountId in users[userId].accounts) {
        let count = await BrainstormService.liveResults(parseInt(accountId))
        msg += ' - ' + users[userId].accounts[accountId] + ': ' + count + '/6\n'
      }

      bot.sendMessage(userId, {
        text: msg
      })
    }
  }

  bot.sendMessage(me, {
    text: adminInfo(questionsRequests, liveRequests)
  })
})

// emitter.on(STOP, (questionsRequests: number, liveRequests: number) => {
//   let title = 'I was forced to stop by the admin.\nNot running anymore. :/'
//
//   notifyAll(title)
//   console.log(title)
//
//   bot.sendMessage(permittedUsers[0], {
//     text: adminInfo(questionsRequests, liveRequests)
//   })
// })

/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/
function isAdmin(senderId) {
  return me == senderId
}

function notifyError(message, error) {
  console.error(message, error)
  Pushover.send(message, error.message)
}

function notifyAll(msg: string) {
  if (brainService.getIsTesting()) {
    bot.sendMessage(me, {
      text: msg
    })
  } else {
    Object.keys(users).forEach(id => {
      bot.sendMessage(id, {
        text: msg
      })
    })
  }
}

function adminInfo(questionsRequests, liveRequests) {
  return `Total requests:\n    Questions -> ${questionsRequests}\n    Live -> ${liveRequests}`
}

function isRegistered(senderId) {
  return users[senderId]
}

function totalAccounts() {
  let total = 0
  for (let u in users) {
    total += Object.keys(users[u].accounts).length
  }

  return total
}

function getUserAccounts(senderId) {
  return users[senderId].accounts
}

/*
|--------------------------------------------------------------------------
| Get started configuration
|--------------------------------------------------------------------------
*/
bot
  .setGetStartedButton({
    payload: 'GET_STARTED_PAYLOAD'
  })
  .then(res => {
    console.log('Finished get started button.', res)
  })

bot
  .setGreeting([
    {
      locale: 'default',
      text: 'Register to receive the answers from here. :)'
    }
  ])
  .then(res => {
    console.log('Finished setting greeting.', res)
  })

bot
  .setPersistentMenu([
    {
      locale: 'default',
      composer_input_disabled: true,
      call_to_actions: [
        {
          type: 'postback',
          title: 'Status',
          payload: POSTBACK_STATUS
        },
        {
          type: 'nested',
          title: 'Account',
          call_to_actions: [
            {
              type: 'postback',
              title: 'My Accounts',
              payload: POSTBACK_ACCOUNTS
            },
            {
              type: 'postback',
              title: 'Register',
              payload: POSTBACK_REGISTER
            },
            {
              type: 'postback',
              title: 'Unregister',
              payload: POSTBACK_UNREGISTER
            }
          ]
        },
        {
          type: 'nested',
          title: 'Manage',
          call_to_actions: [
            {
              type: 'postback',
              title: 'Start',
              payload: POSTBACK_START
            },
            {
              type: 'postback',
              title: 'Stop',
              payload: POSTBACK_STOP
            },
            {
              type: 'postback',
              title: 'Users',
              payload: POSTBACK_USERS
            },
            {
              type: 'postback',
              title: 'Testing',
              payload: POSTBACK_TESTING
            }
          ]
        }
      ]
    }
  ])
  .then(res => {
    console.log('setted menu', res)
  })

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
router.get('/', (req, res) => {
  return bot._verify(req, res)
})

router.post('/', (req, res) => {
  bot._handleMessage(req.body)
  res.end(JSON.stringify({ status: 'ok' }))
})

export default router
