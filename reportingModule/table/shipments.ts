import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment',
      columns: [
        {
          name: 'houseNo',
          type: 'string',
        },

        {
          // warning  : DATE ("YYYY-MM-DD")
          name: 'jobDate',
          type: 'string',
        },

        {
          name: 'masterNo',
          type: 'string',
        },

        {
          name: 'bookingNo',
          type: 'string',
        },

        {
          name: 'poNo',
          type: 'string',
        },

        {
          name: 'contractNo',
          type: 'string',
        },

        {
          name: 'commodity',
          type: 'string',
        },

        {
          name: 'carrierCode',
          type: 'string',
        },

        // {
        //   name: 'vesselName',
        //   type: 'string',
        // },

        // {
        //   name: 'voyage',
        //   type: 'string',
        // },

        // {
        //   name: 'division',
        //   type: 'string',
        // },

        // ["FCL", "LCL", "CONSOL"]
        {
          name: 'serviceCode',
          type: 'string',
        },

        {
          name: 'incoTermsCode',
          type: 'string',
        },

        {
          name: 'freightTermsCode',
          type: 'string',
        },

        {
          name: 'otherTermsCode',
          type: 'string',
        },

        // ["SEA", "AIR", "ROAD"]
        {
          name: 'moduleTypeCode',
          type: 'string',
        },

        {
          name: 'boundTypeCode',
          type: 'string',
        },

        {
          name: 'nominatedTypeCode',
          type: 'string',
        },
        {
          name: 'isDirect',
          type: 'string',
        },
        {
          name: 'isCoload',
          type: 'string',
        },

        {
          name: 'portOfLoadingCode',
          type: 'string',
        },

        {
          name: 'portOfDischargeCode',
          type: 'string',
        },

        {
          name: 'depatureDateEstimated',
          type: 'string',
        },
        {
          name: 'arrivalDateEstimated',
          type: 'string',
        },
        {
          name: 'depatureDateActual',
          type: 'string',
        },
        {
          name: 'arrivalDateActual',
          type: 'string',
        },

        {
          name: 'forwarderPartyName',
          type: 'string',
        },
        {
          name: 'forwarderPartyCustomCode',
          type: 'string',
        },

        {
          name: 'shipperPartyName',
          type: 'string',
        },
        {
          name: 'shipperPartyCustomCode',
          type: 'string',
        },
        {
          name: 'shipperPartryShortName',
          type: 'string',
        },
        {
          name: 'consigneePartyName',
          type: 'string',
        },
        {
          name: 'consigneePartyCode',
          type: 'string',
        },

        {
          name: 'linerAgentPartyName',
          type: 'string',
        },
        {
          name: 'linerAgentPartyCode',
          type: 'string',
        },
        {
          name: 'roAgentPartyName',
          type: 'string',
        },
        {
          name: 'roAgentPartyCode',
          type: 'string',
        },
        {
          name: 'agentPartyName',
          type: 'string',
        },
        {
          name: 'agentPartyCode',
          type: 'string',
        },
        {
          name: 'controllingCustomerPartyName',
          type: 'string',
        },
        {
          name: 'controllingCustomerPartyCode',
          type: 'string',
        },
        {
          name: 'rSalesmanCode',
          type: 'string',
        },
        {
          name: 'rSalesmanName',
          type: 'string',
        },

        // {
        //   name: 'cSalesmanCode',
        //   type: 'string',
        // },

        // {
        //   name: 'cSalesmanName',
        //   type: 'string',
        // },

        // TODO
      ],
    },
    'shipment'
  ),
})

export default query.toJson()
