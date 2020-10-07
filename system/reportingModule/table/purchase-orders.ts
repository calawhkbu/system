import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['purchaseOrder', 'purchase_order']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'poNo' },
    { key: 'moduleType' },
    { key: 'incoTerms' },
    { key: 'freightTerms' },

    { key: 'portOfLoadingCode' },
    { key: 'portOfLoadingName' },
    // { key: 'portOfLoading' },
  
    { key: 'portOfDischargeCode' },
    { key: 'portOfDischargeName' },
    // { key: 'portOfDischarge' }
    
    { key: 'updatedAt'}
  
  ],
} as JqlDefinition