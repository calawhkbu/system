import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/booking/query/booking',
      columns: [
        {
          name: 'updatedAt',
          type: 'string',
        },
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'bookingNo',
          type: 'string',
        },
        {
          name: 'moduleTypeCode',
          type: 'string',
        },
        {
          name: 'boundTypeCode',
          type: 'string',
        },
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
        {
          name: 'vesselName',
          type: 'string',
        },
        {
          name: 'voyageFlightNumber',
          type: 'string',
        },
        {
          name: 'commodity',
          type: 'string',
        },
        {
          name: 'polHScode',
          type: 'string',
        },
        // {
        //   name: 'podHScode',
        //   type: 'string',
        // },
        {
          name: 'placeOfReceiptCode',
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
          name: 'placeOfDeliveryCode',
          type: 'string',
        },
        // {
        //   name: 'finalDestinationCode',
        //   type: 'string',
        // },
        {
          name: 'cargoReadyDateEstimated',
          type: 'string',
        },
        {
          name: 'cargoReadyDateActual',
          type: 'string',
        },
        {
          name: 'cargoReadyDateRemark',
          type: 'string',
        },
        {
          name: 'cYCutOffDateEstimated',
          type: 'string',
        },
        {
          name: 'cYCutOffDateActual',
          type: 'string',
        },
        {
          name: 'cYCutOffDateRemark',
          type: 'string',
        },
        {
          name: 'departureDateEstimated',
          type: 'string',
        },
        {
          name: 'departureDateActual',
          type: 'string',
        },
        {
          name: 'departureDateRemark',
          type: 'string',
        },
        {
          name: 'arrivalDateEstimated',
          type: 'string',
        },
        {
          name: 'arrivalDateActual',
          type: 'string',
        },
        {
          name: 'arrivalDateRemark',
          type: 'string',
        },
        {
          name: 'createdUserEmail',
          type: 'string',
        },
        {
          name: 'updatedUserEmail',
          type: 'string',
        },
        {
          name: 'shipperPartyCode',
          type: 'string',
        },
        {
          name: 'shipperPartyName',
          type: 'string',
        },
        {
          name: 'shipperPartyContactEmail',
          type: 'string',
        },
        {
          name: 'shipperPartyContactName',
          type: 'string',
        },
        {
          name: 'consigneePartyCode',
          type: 'string',
        },
        {
          name: 'consigneePartyName',
          type: 'string',
        },
        {
          name: 'consigneePartyContactEmail',
          type: 'string',
        },
        {
          name: 'consigneePartyContactName',
          type: 'string',
        },
        {
          name: 'forwarderPartyName',
          type: 'string',
        },
        {
          name: 'forwarderPartyCode',
          type: 'string',
        },
        {
          name: 'forwarderPartyContactEmail',
          type: 'string',
        },
        {
          name: 'forwarderPartyContactName',
          type: 'string',
        },
        {
          name: 'notifyPartyPartyCode',
          type: 'string',
        },
        {
          name: 'notifyPartyPartyName',
          type: 'string',
        },
        {
          name: 'notifyPartyPartyContactEmail',
          type: 'string',
        },
        {
          name: 'notifyPartyPartyContactName',
          type: 'string',
        },
        {
          name: 'agentPartyCode',
          type: 'string',
        },
        {
          name: 'agentPartyName',
          type: 'string',
        },
        {
          name: 'agentPartyContactEmail',
          type: 'string',
        },
        {
          name: 'agentPartyContactName',
          type: 'string',
        },
      ],
    },
    'booking'
  ),
})

export default query.toJson()
