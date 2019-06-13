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
          rules: async (
            entity: any,
            user: {
              roles: { name: string }[]
            }
          ) => {
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
          events: async (
            entity: any,
            helper: { sendAlert: () => void }
          ) => {
            if (helper.sendAlert) {
              return helper.sendAlert()
            }
            return true
          }
        }
      ],
      nextStatus: async (entity: any) => {
        return ['Booked']
      }
    }
  ]
}
