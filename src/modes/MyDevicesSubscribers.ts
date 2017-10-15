import Pushover from '../services/Pushover'
import { IQuestion, rightAnswer } from '../storm/IQuestion'
import config from '../config/config'

export const notifyStart = () => {
  const title = config.name + ' is starting.'
  const msg = 'Will wait for live event.'

  console.log(title, msg)
  sendToPushover(title, msg)
}

export const notifyLive = () => {
  const title = 'Brainstorm is live!'
  const msg = 'Waiting for questions..'

  console.log(title, msg)
  sendToPushover(title, msg)
}

export const notifyQuestion = (question: IQuestion, count: number) => {
  let answer = rightAnswer(question)
  const title = 'Answer: ' + answer + ' ' + count + '/6'
  const msg = question.text

  console.log(title, msg)
  sendToPushover(title, msg)
}

export const notifyEnd = (questionsRequests: number, liveRequests: number) => {
  const title = 'Finished for today!'
  const msg = `Requests: Questions -> ${questionsRequests} Live -> ${liveRequests}`

  console.log(title, msg)
  sendToPushover(title, msg)
}

export const notifyStop = (questionsRequests: number, liveRequests: number) => {
  const title = 'Program was canceled!'
  const msg = `Requests: Questions -> ${questionsRequests} Live -> ${liveRequests}`

  console.log(title, msg)
  sendToPushover(title, msg)
}

/*
|--------------------------------------------------------------------------
| Senders
|--------------------------------------------------------------------------
*/
function sendToPushover(title: string, body: string) {
  if (config.sendNotification) Pushover.send(title, body)
}
