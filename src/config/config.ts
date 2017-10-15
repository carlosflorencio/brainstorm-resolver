interface ICustomUser {
  name: string
  id: number
}

interface IConfig {
  pushover: {
    app_key: string
    user_key: string
  }
  isTesting: boolean
  version: number
  sendNotification: boolean
  requestsDelays: {
    betweenQuestions: number
    betweenLive: number
  }
  bot: {
    page_token: string
    verify: string
    app_secret: string
  }
  name: string
  users?: ICustomUser[]
}

const config: IConfig = {
  name: 'Brainstorm Resolver',
  version: 1.0,
  requestsDelays: {
    betweenLive: 7000,
    betweenQuestions: 3000
  },
  pushover: {
    app_key: 'key',
    user_key: 'user_key'
  },
  isTesting: false,
  sendNotification: true,
  bot: {
    page_token: 'fb page token',
    verify: 'hdn programmers are the best',
    app_secret: 'secret'
  }
}

export default config
