import moment = require('moment')

export default {
  defaultStatus: 'Booked',
  startDate: null,
  statusList: [
    {
      name: 'Booked',
      expiryDate: async (entity: any, now: Date) => {
        return moment(now).add(2, 'days').toDate()
      },
      onEnterValidation: [
        {
          rules: async (entity: any, user: { roles: { name: string }[] }) => {
            if (user.roles.filter((role) => ['Admin', 'User'].filter((r) => r === role.name))) {
              return true
            }
            return false
          },
          onError: async (entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole'
            }
          }
        }
      ],
      afterEnterEvents: [
        {
          events: async (entity: any, helper: { sendAlert: () => void }) => {
            if (helper.sendAlert) {
              return helper.sendAlert()
            }
            return true
          }
        }
      ],
      nextStatus: async (entity: any) => {
        if (entity.moduleTypeCode === 'SEA') {
          return ['Shipping Advice Ready (SEA)', 'Cancelled']
        } else if (entity.moduleTypeCode === 'AIR') {
          return ['Shipping Advice Ready (AIR)', 'Cancelled']
        }
        return ['Cancelled']
      }
    },
    {
      name: 'Shipping Advice Ready (SEA)',
      expiryDate: async (entity: any, now: Date) => {
        return moment(now).add(2, 'days').toDate()
      },
      onEnterValidation: [
        {
          rules: async (entity: any, user: { roles: { name: string }[] }) => {
            if (user.roles.filter((role) => ['Admin', 'User'].filter((r) => r === role.name))) {
              return true
            }
            const documents = entity.documents.find(doc => doc.fileName === 'Shipping Advice')
            if (documents.length > 0) {
              return true
            }
            if (entity.commodity) {
              return true
            }
            return false
          },
          onError: async (entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole'
            }
          }
        }
      ],
      afterEnterEvents: [
        {
          events: async (entity: any, helper: { sendAlert: () => void }) => {
            if (helper.sendAlert) {
              return helper.sendAlert()
            }
            return true
          }
        }
      ],
      nextStatus: async (entity: any) => {
        return ['Cancelled']
      }
    },
    {
      name: 'Cancelled',
      expiryDate: async (entity: any, now: Date) => {
        return moment(now).toDate()
      },
      nextStatus: async (entity: any) => {
        return []
      }
    }
  ]
}
