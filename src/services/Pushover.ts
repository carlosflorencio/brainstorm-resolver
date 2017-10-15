import { Client, User, Message } from 'chump'
import config from '../config/config'

const CLIENT = new Client(config.pushover.app_key)
const USER = new User(config.pushover.user_key)

export default class Pushover {
  static send(title: string, body: string = '') {
    const msg = new Message({
      title: title,
      message: body,
      user: USER
    })

    return CLIENT.sendMessage(msg)
  }
}
