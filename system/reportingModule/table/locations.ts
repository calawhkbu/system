import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['location', 'location']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'countryCode' },
    { key: 'portCode' },
    { key: 'moduleTypeCode' },
    { key: 'name' },
    { key: 'canDelete' },
    { key: 'canRestore' }
  ]
} as JqlDefinition
