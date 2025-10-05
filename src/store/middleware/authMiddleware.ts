import { createListenerMiddleware } from '@reduxjs/toolkit'
import { loginSuccess, setUser } from '../authSlice'

const authMiddleware = createListenerMiddleware()

authMiddleware.startListening({
    actionCreator: loginSuccess,
    effect: (action) => {
        localStorage.setItem('user', JSON.stringify(action.payload.user))
    }
})

authMiddleware.startListening({
    actionCreator: setUser,
    effect: (action) => {
        localStorage.setItem('user', JSON.stringify(action.payload))
    }
})

export { authMiddleware }