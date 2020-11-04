import { JqlDefinition } from 'modules/report/interface'
import SopTaskJQL from './sop-task'

export default {
  jqls: [
    SopTaskJQL.jqls[0],
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['sop_task', 'sop_task']
    }
  ]
} as JqlDefinition

