import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['template', 'template']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'templateName' },
    { key: 'extension' },
    { key: 'canDelete' },
    { key: 'canRestore' },
  ]
} as JqlDefinition
