import { Router } from 'express'
import { loginController } from '../../login/controllers/login'
import { forgotPassword, resetPassword } from '../../login/controllers/authControllers'
import { RegisterController } from '../../login/controllers/register'

const loginRouter = Router()

loginRouter.post('/login', loginController)
loginRouter.post('/register', RegisterController)
loginRouter.post('/forgot-password', forgotPassword)
loginRouter.post('/reset-password', resetPassword)

export { loginRouter }
