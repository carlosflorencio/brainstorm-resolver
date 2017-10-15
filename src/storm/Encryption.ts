import * as crypto from 'crypto'

// Yep, this is purposely hardcoded here
// you only live once -> #yolo
const IV = 'XgE;Ks/cffa!S>`L'
const SECRET = 'XgE;Ks/cffa!S>`LFaj6pfmU7xH:CT#G'

// All requests/responses are encripted
export default class Encryption {
  public static encrypt(str: string): string {
    const cipher = crypto.createCipheriv('aes256', SECRET, IV)

    let crypted = cipher.update(str, 'utf8', 'base64')
    crypted += cipher.final('base64')

    return crypted
  }

  public static decrypt(str: string): string {
    const decipher = crypto.createDecipheriv('aes256', SECRET, IV)

    let dec = decipher.update(str, 'base64', 'utf8')
    dec += decipher.final('utf8')

    return dec
  }
}
