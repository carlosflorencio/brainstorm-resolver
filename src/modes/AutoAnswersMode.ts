import { IQuestion } from '../storm/IQuestion'
import { sleep } from '../helpers/Utils'
import BrainstormService from '../storm/BrainstormService'
import * as EventEmitter from 'events'
import config from '../config/config'

// Delays between requests
const LIVE_DELAY = config.requestsDelays.betweenLive
const QUESTION_DELAY = config.requestsDelays.betweenQuestions

// Emitter class
export class BrainEmitter extends EventEmitter {}

/**
 * Events
 *
 * @type {string}
 */
export const LIVE = 'live'
export const QUESTION = 'question'
export const END = 'end'
export const STOP = 'stop'
export const STARTING = 'starting'

/**
 * Subscribe to the events
 *
 * const mode = new AutoAnswersMode()
 * const emitter = mode.subscribe()
 *
 * emitter.on(QUESTION, question => {
 *  console.log(question.text)
 * })
 *
 * mode.start()
 */
export class AutoAnswersMode {
  private isRunning: boolean
  private emitter: BrainEmitter
  private questions: Array<IQuestion>
  private questionsRequests: number
  private liveRequests: number
  private isLive: boolean
  private isTesting: boolean

  public constructor() {
    this.isRunning = false
    this.emitter = new BrainEmitter()
    this.questionsRequests = 0
    this.liveRequests = 0
    this.questions = []
    this.isLive = false
    this.isTesting = config.isTesting
  }

  /**
   * Main logic here
   *
   * @returns {Promise<any>}
   */
  public async start() {
    this.isRunning = true
    this.emitter.emit(STARTING)

    const isLive = await this.whenIsLive()

    if (!isLive) return this.end() // stoped

    this.isLive = true

    this.emitter.emit(LIVE)

    while (this.questions.length < 6) {
      const question = await this.getNextQuestion()

      if (!question) return this.end() // stoped

      this.questions.push(question)

      this.emitter.emit(QUESTION, question, this.questions.length)
    }

    this.end()
  }

  /**
   * Only returns when it has the next question
   * (different from the last one)
   *
   * @returns {Promise<IQuestion>}
   */
  private async getNextQuestion(): Promise<IQuestion | null> {
    let question: IQuestion | null = null

    while (this.isRunning) {
      await sleep(QUESTION_DELAY)

      if (this.isTesting) {
        question = await BrainstormService.getTestQuestion()
      } else {
        question = await BrainstormService.getLiveQuestion()
        this.questionsRequests++
      }

      if (question !== null) {
        const length = this.questions.length

        if (length === 0 || this.questions[length - 1].id !== question.id) {
          return question
        }
      }
    }

    return null
  }

  /**
   * Only returns when the show is live
   * or when canceled
   *
   * @returns {Promise<boolean>}
   */
  private async whenIsLive() {
    let isLive = false
    do {
      if (!this.isRunning) return false

      if (this.isTesting) {
        isLive = true
      } else {
        await sleep(LIVE_DELAY)
        isLive = await BrainstormService.isLive()
        this.liveRequests++
      }
    } while (!isLive)

    return true
  }

  public stop() {
    if (this.isRunning) {
      // only emit if it was running
      this.emitter.emit(STOP, this.questionsRequests, this.liveRequests)
      this.isRunning = false
    }
  }

  private end() {
    this.emitter.emit(END, this.questionsRequests, this.liveRequests)
    this.reset()
  }

  private reset() {
    this.isLive = false
    this.isRunning = false
    this.questions = []
    this.questionsRequests = 0
    this.liveRequests = 0
  }

  /*
  |--------------------------------------------------------------------------
  | Getters
  |--------------------------------------------------------------------------
  */
  public getIsRunning(): boolean {
    return this.isRunning
  }

  public getIsLive(): boolean {
    return this.isLive
  }

  public getQuestions(): IQuestion[] {
    return this.questions
  }

  public subscribe(): BrainEmitter {
    return this.emitter
  }

  public getQuestionsRequests() {
    return this.questionsRequests
  }

  public getLiveRequests() {
    return this.liveRequests
  }

  public getIsTesting() {
    return this.isTesting
  }

  public setTesting(testing: boolean) {
    this.isTesting = testing
  }
}
