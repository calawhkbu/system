import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['party', 'related-party']
    }
  ],
  columns: [
    { key: 'partyAId' },
    { key: 'partyAName' },
    { key: 'partyAShortName' },
    { key: 'partyAGroupName' },
    { key: 'partyAErpCode' },
    { key: 'partyBId' },
    { key: 'partyBName' },
    { key: 'partyBShortName' },
    { key: 'partyBGroupName' },
    { key: 'partyBErpCode' },
    { key: 'partyType' },
    { key: 'showDelete' },
  ]
} as JqlDefinition
