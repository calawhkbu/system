import { Query, FromTable, ResultColumn, ColumnExpression } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment',
      columns: [
        { name: 'primaryKey', type: 'string' },
        { name: 'site', type: 'string' },
        { name: 'houseNo', type: 'string' },
        { name: 'jobDate', type: 'Date' },
        { name: 'jobNo', type: 'string' },
        { name: 'masterNo', type: 'string' },
        { name: 'bookingNo', type: 'string' },
        { name: 'poNo', type: 'string' },
        { name: 'contractNo', type: 'string' },
        { name: 'commodity', type: 'string' },

        { name: 'carrierCode', type: 'string' },
        { name: 'carrierName', type: 'string' },

        // { name: 'vessel', type: 'string' },
        { name: 'voyage', type: 'string' },
        { name: 'division', type: 'string' },
        { name: 'serviceCode', type: 'string' },
        { name: 'incoTermsCode', type: 'string' },
        { name: 'freightTermsCode', type: 'string' },
        { name: 'otherTermsCode', type: 'string' },
        { name: 'moduleTypeCode', type: 'string' },
        { name: 'boundTypeCode', type: 'string' },
        { name: 'nominatedTypeCode', type: 'string' },
        { name: 'isDirect', type: 'boolean' },
        { name: 'isCoload', type: 'boolean' },
        { name: 'shipmentTypeCode', type: 'string' },

        { name: 'placeOfReceiptCode', type: 'string' },
        { name: 'portOfLoadingCode', type: 'string' },
        { name: 'portOfDischargeCode', type: 'string' },
        { name: 'placeOfDeliveryCode', type: 'string' },
        { name: 'finalDestinationCode', type: 'string' },

        // { name: 'placeOfReceiptName', type: 'string' },
        // { name: 'portOfLoadingName', type: 'string' },
        // { name: 'portOfDischargeName', type: 'string' },
        // { name: 'placeOfDeliveryName', type: 'string' },
        // { name: 'finalDestinationName', type: 'string' },

        { name: 'departureDateEstimated', type: 'Date' },
        { name: 'departureDateActual', type: 'Date' },
        { name: 'arrivalDateEstimated', type: 'Date' },
        { name: 'arrivalDateActual', type: 'Date' },

        { name: 'forwarderPartyCode', type: 'string' },
        { name: 'forwarderPartyName', type: 'string' },
        { name: 'shipperPartyCode', type: 'string' },
        { name: 'shipperPartyName', type: 'string' },
        { name: 'consigneePartyCode', type: 'string' },
        { name: 'consigneePartyName', type: 'string' },
        { name: 'linerAgentPartyCode', type: 'string' },
        { name: 'linerAgentPartyName', type: 'string' },
        { name: 'roAgentPartyCode', type: 'string' },
        { name: 'roAgentPartyName', type: 'string' },
        { name: 'agentPartyCode', type: 'string' },
        { name: 'agentPartyName', type: 'string' },
        { name: 'controllingCustomerPartyCode', type: 'string' },
        { name: 'controllingCustomerPartyName', type: 'string' },

        { name: 'salesmanCode', type: 'string' },
      ],
    },
    'shipment'
  ),
})

export default query.toJson()
