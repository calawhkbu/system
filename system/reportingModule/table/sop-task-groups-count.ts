import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['sop_template', 'sop_template']
    }
  ],
  columns: [
    { key: 'count' }
  ]
} as JqlDefinition
