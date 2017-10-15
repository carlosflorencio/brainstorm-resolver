import * as request from 'request'
import Encryption from './Encryption'
import { IQuestion } from './IQuestion'
import { IUser } from './IUser'

// Yep, this is hardcoded -> #yolo
const ENDPOINT: string = 'https://app-brainstorm.com/endpoint/'
// const USER: string = 'brainstorm'
// const PASSWORD: string = 'dytOigCeews6'
const CREDENTIALS = 'YnJhaW5zdG9ybTpkeXRPaWdDZWV3czY=' // USER:PASSWORD -> base64

export default class BrainstormService {
  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */
  static async login(email: string, password: string): Promise<IUser | null> {
    let params = {
      action: 'login',
      email: email,
      password: password
    }

    try {
      const res: IResponseViewModel = await BrainstormService.Fetch(params)

      if (res.Result === false) return null

      const parsed = JSON.parse(res.SerializedEntity)
      const user = parsed as IUser

      return user
    } catch (error) {
      return null
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Config
  |--------------------------------------------------------------------------
  */
  static async config(): Promise<any> {
    let params = {
      action: 'config'
    }

    try {
      const res: IResponseViewModel = await BrainstormService.Fetch(params)

      return JSON.parse(res.SerializedEntity)
    } catch (error) {
      return null
    }
  }

  /*
    |--------------------------------------------------------------------------
    | Live result
    |--------------------------------------------------------------------------
    */
  static async liveResults(userId: number): Promise<number> {
    let params = {
      action: 'liveresult',
      userid: userId
    }

    try {
      const res: IResponseViewModel = await BrainstormService.Fetch(params)

      if (res.Result) {
        return parseInt(res.SerializedEntity)
      }

      return -1
    } catch (error) {
      return -1
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Is Live
  |--------------------------------------------------------------------------
  */
  static async isLive(): Promise<boolean> {
    let params = {
      action: 'live'
    }

    try {
      const res: IResponseViewModel = await BrainstormService.Fetch(params)
      return res.Result
    } catch (error) {
      return false
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Submit answers
  |--------------------------------------------------------------------------
  */
  static async submitAnswer(
    userId: number,
    questionId: number,
    answer: number
  ): Promise<boolean> {
    let params = {
      action: 'answer',
      questionid: questionId,
      answer: answer,
      userid: userId
    }

    try {
      const res: IResponseViewModel = await BrainstormService.Fetch(params)

      if (containsErrors(res)) {
        return false
      }

      return res.Result
    } catch (error) {
      return false
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Test Question
  |--------------------------------------------------------------------------
  */
  static async getTestQuestion(): Promise<IQuestion | null> {
    return BrainstormService.getQuestion()
  }

  /*
  |--------------------------------------------------------------------------
  | Live Question
  |--------------------------------------------------------------------------
  */
  static getLiveQuestion(): Promise<IQuestion | null> {
    return BrainstormService.getQuestion(true)
  }

  /*
  |--------------------------------------------------------------------------
  | Get Question
  |--------------------------------------------------------------------------
  */
  private static async getQuestion(live: boolean = false) {
    let params = {
      action: live ? 'livequestion' : 'question'
    }

    try {
      const res: IResponseViewModel = await BrainstormService.Fetch(params)

      if (res.Result === false) return null

      const parsed = JSON.parse(res.SerializedEntity)
      const question = parsed as IQuestion

      return question
    } catch (error) {
      return null
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Fetch
  |--------------------------------------------------------------------------
  */
  private static Fetch(parameters: object): Promise<IResponseViewModel> {
    const content: string = Encryption.encrypt(JSON.stringify(parameters))

    return new Promise((resolve, reject) => {
      const options = {
        url: ENDPOINT,
        method: 'POST',
        body: content,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + CREDENTIALS
        }
      }

      request(options, (err, response, body) => {
        if (err || response.statusCode != 200) {
          reject(err ? err.message : 'Status code: ' + response.statusCode)
        }

        let decrypted = Encryption.decrypt(body)
        let deserialized: IResponseViewModel = JSON.parse(decrypted)

        resolve(deserialized)
      })
    })
  }
}

interface IResponseViewModel {
  Result: boolean
  Errors: { [key: string]: string }
  SerializedEntity: string
}

function containsErrors(model: IResponseViewModel) {
  if (model.Errors && Object.keys(model.Errors).length > 0) {
    return true
  }

  return false
}
