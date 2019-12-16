import moment = require('moment')

export default {
  defaultStatus: 'Booked',
  startDate: null,
  statusList: [
    {
      name: 'Booked',
      expiryDate: async(entity: any, now: Date) => {
        return moment(now)
          .add(2, 'days')
          .toDate()
      },
      onEnterValidation: [],
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        if (entity.moduleTypeCode === 'SEA') {
          return ['Shipping Advice Ready (SEA)', 'Cancelled']
        } else if (entity.moduleTypeCode === 'AIR') {
          return ['Shipping Advice Ready (AIR)', 'Cancelled']
        }
        return ['Cancelled']
      },
    },
    {
      name: 'Shipping Advice Ready (SEA)',
      expiryDate: async(entity: any, now: Date) => {
        if (entity.departureDateEstimated) {
          return moment(entity.departureDateEstimated)
            .add(-2, 'days')
            .toDate()
        }
        return null
      },
      onEnterValidation: [
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            const documents = (entity.documents || []).find(
              doc => doc.fileName === 'Shipping Advice'
            )
            if (documents.length > 0) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {}
          },
        },
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (entity.commodity) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {}
          },
        },
      ],
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        return ['Shipping Advice Confirmed', 'Cancelled']
      },
    },
    {
      name: 'Shipping Advice Ready (AIR)',
      expiryDate: async(entity: any, now: Date) => {
        if (entity.departureDateEstimated) {
          return moment(entity.departureDateEstimated)
            .add(-2, 'days')
            .toDate()
        }
        return null
      },
      onEnterValidation: [
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            console.log(user.roles)
            if (user && user.roles.filter(role => ['Admin', 'User'].filter(r => r === role.name))) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole',
            }
          },
        },
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            const documents = (entity.documents || []).find(
              (doc: { fileName: string }) => doc.fileName === 'Shipping Advice'
            )
            if (documents) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {
              error: 'Workflow.MissingDocument',
              components: [],
            }
          },
        },
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (entity.commodity) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {}
          },
        },
      ],
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        return ['Shipping Advice Confirmed', 'Cancelled']
      },
    },
    {
      name: 'Shipping Advice Confirmed',
      expiryDate: async(entity: any, now: Date) => {
        if (entity.departureDateEstimated) {
          return moment(entity.departureDateEstimated)
            .add(-1, 'days')
            .toDate()
        }
        return null
      },
      onEnterValidation: [
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (user && user.roles.filter(role => ['Admin', 'User'].filter(r => r === role.name))) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole',
            }
          },
        },
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            const documents = entity.documents.find(doc => doc.fileName === 'Shipping Instructions')
            if (documents.length > 0) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {}
          },
        },
      ],
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        return ['Shipping Instructions Ready']
      },
    },
    {
      name: 'Shipping Instructions Ready',
      expiryDate: async(entity: any, now: Date) => {
        if (entity.departureDateEstimated) {
          return moment(entity.departureDateEstimated).toDate()
        }
        return null
      },
      onEnterValidation: [
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (user && user.roles.filter(role => ['Admin', 'User'].filter(r => r === role.name))) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole',
            }
          },
        },
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            const documents = entity.documents.find(doc => doc.fileName === 'Shipping Instructions')
            if (documents.length > 0) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {}
          },
        },
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (entity.portOfLoadingCode && entity.portOfDischargeCode) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {}
          },
        },
      ],
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        return ['HBL Ready']
      },
    },
    {
      name: 'HBL Ready',
      expiryDate: async(entity: any, now: Date) => {
        if (entity.departureDateEstimated) {
          return moment(entity.departureDateEstimated)
            .add(2, 'days')
            .toDate()
        }
        return null
      },
      onEnterValidation: [
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (user && user.roles.filter(role => ['Admin', 'User'].filter(r => r === role.name))) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole',
            }
          },
        },
      ],
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        return ['ASN Ready']
      },
    },
    {
      name: 'ASN Ready',
      expiryDate: async(entity: any, now: Date) => {
        if (entity.departureDateEstimated) {
          return moment(entity.departureDateEstimated)
            .add(3, 'days')
            .toDate()
        }
        return null
      },
      onEnterValidation: [
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (user && user.roles.filter(role => ['Admin', 'User'].filter(r => r === role.name))) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole',
            }
          },
        },
      ],
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        return ['ASN Doc Checked']
      },
    },
    {
      name: 'ASN Doc Checked',
      expiryDate: async(entity: any, now: Date) => {
        if (entity.departureDateEstimated) {
          return moment(entity.departureDateEstimated)
            .add(4, 'days')
            .toDate()
        }
        return null
      },
      onEnterValidation: [
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (user && user.roles.filter(role => ['Admin', 'User'].filter(r => r === role.name))) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole',
            }
          },
        },
      ],
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        return ['ASN Doc Approved']
      },
    },
    {
      name: 'ASN Doc Approved',
      expiryDate: async(entity: any, now: Date) => {
        if (entity.departureDateEstimated) {
          return moment(entity.departureDateEstimated)
            .add(4, 'days')
            .toDate()
        }
        return null
      },
      onEnterValidation: [
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (user && user.roles.filter(role => ['Admin', 'User'].filter(r => r === role.name))) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole',
            }
          },
        },
      ],
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        return ['Completed']
      },
    },
    {
      name: 'Completed',
      onEnterValidation: [
        {
          rules: async(entity: any, user: { roles: { name: string }[] }) => {
            if (user && user.roles.filter(role => ['Admin', 'User'].filter(r => r === role.name))) {
              return true
            }
            return false
          },
          onError: async(entity: any, workflow: any) => {
            return {
              error: 'Workflow.NotAllowByRole',
            }
          },
        },
      ],
      afterEnterEvents: [],
      expiryDate: async(entity: any, now: Date) => {
        return null
      },
      nextStatus: async(entity: any) => {
        return []
      },
    },
    {
      name: 'Cancelled',
      expiryDate: async(entity: any, now: Date) => {
        return null
      },
      afterEnterEvents: [],
      nextStatus: async(entity: any) => {
        return []
      },
      canRevert: true,
    },
  ],
}
