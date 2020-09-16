import { JqlDefinition } from 'modules/report/interface'

export default {
  constants: {
    name : 'fr',
    typeCodeList : ['F', 'R', 'T']
  },
  extend: 'card/booking-month-frc',
  filters: [
    // for this filter, user can only select single,
    // but when config in card definition, use summaryVariables. Then we can set as multi
    {
      display: 'topX',
      name: 'topX',
      props: {
        items: [
          {
            label: '10',
            value: 10,
          },
          {
            label: '20',
            value: 20,
          },
          {
            label: '50',
            value: 50,
          },
          {
            label: '100',
            value: 100,
          },
          {
            label: '1000',
            value: 1000,
          }
        ],
        multi : false,
        required: true,
      },
      type: 'list',
    },
    {
      display: 'summaryVariables',
      name: 'summaryVariables',
      hidden:true,
      props: {
        items: [
          {
            label: 'chargeableWeight',
            value: 'chargeableWeight',
          },
          {
            label: 'grossWeight',
            value: 'grossWeight',
          },
          {
            label: 'cbm',
            value: 'cbm',
          },
          {
            label: 'totalBooking',
            value: 'totalBooking',
          },
          {
            label: 'teu',
            value: 'teu',
          },
       
          {
            label: 'quantity',
            value: 'quantity',
          },
    
        ],
        multi: false,
        required: true,
      
      },
      type: 'list',
    },
    {
      display: 'groupByEntity',
      name: 'groupByEntity',
      props: {
        items: [
          {
            label: 'carrier',
            value: 'carrier',
          },
          {
            label: 'shipper',
            value: 'shipper',
          },
          {
            label: 'consignee',
            value: 'consignee',
          },
          {
            label: 'agent',
            value: 'agent',
          },
          {
            label: 'agentGroup',
            value: 'agentGroup',
          },
          {
            label: 'controllingCustomer',
            value: 'controllingCustomer',
          },
          {
            label: 'linerAgent',
            value: 'linerAgent',
          },
          {
            label: 'roAgent',
            value: 'roAgent',
          },
          {
            label: 'office',
            value: 'forwarder',
          },
          {
            label : 'moduleType',
            value : 'moduleType'
          },
          {
            label : 'houseNo',
            value : 'houseNo'
          }
        ],
        required: true,
      },
      type: 'list',
    },
  ]
} as JqlDefinition

