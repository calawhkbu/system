import { JwtPayload, JwtPayloadRole } from 'modules/auth/interfaces/jwt-payload'

export default {
  storage: {
    config: () => {
      throw new Error('Please override it in Customer folder')
    }
  },
  document: {
    defaultType: {
      'purchase-order': [],
      booking: [],
      shipment: []
    },
    canView: (type:string, user: JwtPayload) => {
      return user.selectedRoles.reduce((canView: boolean, role: JwtPayloadRole) => {
        if (canView) {
          if (role.name === `BLOCKDOC_${type}`) {
            canView = false
          }
        }
        return canView
      }, true)
    },
    canUpload: (type:string, user: JwtPayload) => {
      return user.selectedRoles.reduce((canView: boolean, role: JwtPayloadRole) => {
        if (canView) {
          if (role.name === `BLOCKUPLOADDOC_${type}`) {
            canView = false
          }
        }
        return canView
      }, true)
    },
    canDownload: (type:string, user: JwtPayload) => {
      return user.selectedRoles.reduce((canView: boolean, role: JwtPayloadRole) => {
        if (canView) {
          if (role.name === `BLOCKDOWNLOADDOC_${type}`) {
            canView = false
          }
        }
        return canView
      }, true)
    },
    canDelete: (type:string, user: JwtPayload) => {
      return user.selectedRoles.reduce((canView: boolean, role: JwtPayloadRole) => {
        if (canView) {
          if (role.name === `BLOCKDELETEDOC_${type}`) {
            canView = false
          }
        }
        return canView
      }, true)
    },
    canRestore: (type:string, user: JwtPayload) => {
      return user.selectedRoles.reduce((canView: boolean, role: JwtPayloadRole) => {
        if (canView) {
          if (role.name === `BLOCKRESTOREDOC_${type}`) {
            canView = false
          }
        }
        return canView
      }, true)
    }
  }
}
