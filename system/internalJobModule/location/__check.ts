import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

// is SWIVEL_ADMIN
export default function checkAccess(user: JwtPayload): boolean {
  return !!user.selectedRoles.find(({ id }) => id === 1)
}