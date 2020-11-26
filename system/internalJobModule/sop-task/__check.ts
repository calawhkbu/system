import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

// is SWIVEL_ADMIN or SOP_TASK_MANAGER
export default function checkAccess(user: JwtPayload): boolean {
  return !!user.selectedRoles.find(({ name }) => name === 'SWIVEL_ADMIN' || name === 'SOP_TASK_MANAGER')
}