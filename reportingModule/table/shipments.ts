import { Query, FromTable, ResultColumn, ColumnExpression } from 'node-jql'

const query = new Query({

  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment',
      columns: [
        { name: 'houseNo', type: 'string' },
        { name: 'jobDate', type: 'Date' },
        { name: 'masterNo', type: 'string' },
        { name: 'bookingNo', type: 'string' },
        { name: 'poNo', type: 'string' },
        { name: 'contractNo', type: 'string' },
        { name: 'commodity', type: 'string' },
        { name: 'carrierCode', type: 'string' },

        { name: 'voyage', type: 'string' },
        { name: 'division', type: 'string' },

        { name: 'serviceCode', type: 'string' },

        // ["FCL", "LCL", "CONSOL"]
        { name: 'shipmentTypeCode', type: 'string' },

        { name: 'incoTermsCode', type: 'string' },
        { name: 'freightTermsCode', type: 'string' },
        { name: 'otherTermsCode', type: 'string' },

        // ["SEA", "AIR", "ROAD"]
        { name: 'moduleTypeCode', type: 'string' },
        { name: 'boundTypeCode', type: 'string' },

        { name: 'nominatedTypeCode', type: 'string' },

        { name: 'isDirect', type: 'boolean' },
        { name: 'isCoload', type: 'boolean' },

        { name: 'portOfLoadingCode', type: 'string' },
        { name: 'portOfDischargeCode', type: 'string' },

        { name: 'placeOfReceiptCode', type: 'string' },
        { name: 'placeOfDeliveryCode', type: 'string' },
        { name: 'finalDestinationCode', type: 'string' },

        { name: 'departureDateEstimated', type: 'Date' },
        { name: 'arrivalDateEstimated', type: 'Date' },
        { name: 'departureDateActual', type: 'Date' },
        { name: 'arrivalDateActual', type: 'Date' },

        { name: 'shipperPartyName', type: 'string' },
        { name: 'consigneePartyName', type: 'string' },
        { name: 'forwarderPartyName', type: 'string' },
        { name: 'linerAgentPartyName', type: 'string' },
        { name: 'roAgentPartyName', type: 'string' },
        { name: 'agentPartyName', type: 'string' },
        { name: 'controllingCustomerPartyName', type: 'string' },

        { name : 'quantity' , type : 'number' },
        { name: 'salesmanCode', type: 'string' },
      ],

    },
    'shipment'
  ),
})

export default query.toJson()
