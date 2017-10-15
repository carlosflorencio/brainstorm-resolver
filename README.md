[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

### Brainstorm Resolver

RTP show Brainstorm Resolver. This app gets the questions and the right answers when the show is live. It also answers automatically for the registered accounts.

### Modes
- `CLI`: The app can run as a console application.
- `Messenger Bot`: This app can also respond to messenger bot webhooks. [Messenger Platform](https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start)

### Screens

Start                      |  On Finish
:-------------------------:|:-------------------------:
![Screen 1](screens/1.png) |  ![Screen 2](screens/2.png)


### Requirements
- `node` (using v8)
- `yarn` (faster than npm)

### Deploy
- `sudo yarn deploy` 
- `sudo yarn deploy-setup` 

### Instructions to develop
- `yarn install` - installs the dependencies
- `yarn start` - watch's `.ts` files and compiles to `build` folder then the server is reloaded at `localhost:3002`
- `yarn test` - runs the tests
- `yarn build` - compiles `.ts` files to `build` folder
- `yarn serve` - starts the api (`node build/server.js`)
- `yarn prettier` - runs prettier to prettify the code (also runs before each commit)

### Credentials

I obtained the server credentials by decompiling their android mobile app. They used Xamarin and with JetBrains dotPeek, it was easy to see the C# source code.

### License
MIT
