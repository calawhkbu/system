import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['sop_template', 'sop_template']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'tableName' },
    { key: 'category' },
    { key: 'group' },
    { key: 'noOfTasks' },
    { key: 'updatedAt' }
  ]
} as JqlDefinition
