import { Router, Request, Response, NextFunction } from 'express'
import * as os from 'os'
const router = Router()

router.get('/', (req: Request, res: Response) => {
  res.send({
    hostname: os.hostname() + ' uptime: ' + Math.floor(os.uptime()) + 's',
    message: 'Alive!'
  })
})

export default router
