import { authHandlers } from './auth'
import { userHandlers } from './user'
import { roleHandlers } from './role'

export const handlers = [...authHandlers, ...userHandlers, ...roleHandlers]
