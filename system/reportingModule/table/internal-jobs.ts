import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['internal_job', 'internal_job']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'category' },
    { key: 'job' },
    { key: 'status' },
    { key: 'progress' },
    { key: 'elapsed' },
    { key: 'createdAt' },
    { key: 'createdBy' },
    { key: 'error' }
  ]
} as JqlDefinition
