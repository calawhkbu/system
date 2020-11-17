import { Workflow } from 'models/main/workflow'
import moment = require('moment')

export const setDataFunction = {
  statusDate: async({}: Workflow) => {
    return moment.utc().format('YYYY-MM-DD HH:mm:ss')
  },
}

export const mapping = {
  // booking: async (
  //   changeType: 'create'|'update'|'delete',
  //   entity: any,
  // ): Promise<Workflow> => {
  //   switch (changeType) {
  //     case 'create': {
  //       return {
  //         tableName: 'booking',
  //         primaryKey: entity.id,
  //         statusName: 'ACTIVE',
  //
  //       } as Workflow
  //     }
  //   }
  // }
}
