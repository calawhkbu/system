import { JqlDefinition } from 'modules/report/interface'


const documentFileNameList = [
  'Freight Invoice',
  'MBL',
  'HBL Original',
  'HBL Telex released',
  'Commercial Invoice',
  'Packing List',
  'OTHER'
]

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment']
    }
  ],
  columns: [
    { key: 'houseNo' },
    { key: 'jobNo' },
    { key: 'masterNo' },
    { key: 'bookingNo' },
    { key: 'poNos' },
    { key: 'containerNos' },
    { key: 'contractNos' },
    { key: 'commodity' },
    { key: 'vessel' },
    { key: 'voyageFlightNumber' },
    { key: 'divisionCode' },
    { key: 'serviceCode' },
    { key: 'incoTermsCode' },
    { key: 'freightTermsCode' },
    { key: 'otherTermsCode' },
    { key: 'moduleTypeCode' },
    { key: 'boundTypeCode' },
    { key: 'carrierName' },
    { key: 'nominatedTypeCode' },
    { key: 'isDirect' },
    { key: 'isCoload' },
    { key: 'jobDate' },
    { key: 'departureDateEstimated' },
    { key: 'departureDateActual' },
    { key: 'arrivalDateEstimated' },
    { key: 'arrivalDateActual' },
    { key: 'placeOfReceiptName' },
    { key: 'portOfLoadingName' },
    { key: 'portOfDischargeName' },
    { key: 'placeOfDeliveryName' },
    { key: 'finalDestinationName' },
    { key: 'officePartyName' },
    { key: 'shipperPartyName' },
    { key: 'consigneePartyName' },
    { key: 'linerAgentPartyName' },
    { key: 'roAgentPartyName' },
    { key: 'agentPartyName' },
    { key: 'controllingCustomerPartyName' },
    { key: 'id' },
    { key: 'shipId' },
    { key: 'haveCurrentTrackingNo' },
    { key: 'batchNumber' },
    { key: 'lastStatusCodeOrDescription' },
    { key: 'lastStatusDate' },
    { key: 'lastStatusWidget' },

    ...documentFileNameList.map(documentFileName => {

      return { key: `haveDocument_${documentFileName}` }

    })


  ]
} as JqlDefinition

/* import { Query, FromTable, ResultColumn, ColumnExpression } from 'node-jql'

const dateNameList = [
  'oceanBill',
  'cargoReady',
  'scheduleAssigned',
  'scheduleApproaved',
  'spaceConfirmation',
  'bookingSubmit',
  'cyCutOff',
  'documentCutOff',
  'pickup',
  'shipperLoad',
  'returnLoad',
  'cargoReceipt',
  'shipperDocumentSubmit',
  'shipperInstructionSubmit',
  'houseBillDraftSubmit',
  'houseBillConfirmation',
  'masterBillReleased',
  'preAlertSend',
  'ediSend',
  'cargoRolloverStatus',
  'inboundTransfer',
  'onRail',
  'arrivalAtDepot',
  'availableForPickup',
  'pickupCargoBeforeDemurrage',
  'finalCargo',
  'cargoPickupWithDemurrage',
  'finalDoorDelivery',
  'returnEmptyContainer',
  'sentToShipper',
  'gateIn',
  'sentToConsignee',
  'loadOnboard'
]

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment',
      columns: [

        { name: 'houseNo', type: 'string' },
        { name: 'jobNo', type: 'string' },
        { name: 'masterNo', type: 'string' },

        { name: 'bookingNo', type: 'string' },
        { name: 'poNos', type: 'string' },
        { name: 'containerNos', type : 'string' },
        { name: 'contractNos', type: 'string' },

        { name: 'commodity', type: 'string' },
        { name: 'vessel', type: 'string' },
        { name: 'voyageFlightNumber', type: 'string' },
        { name: 'divisionCode', type: 'string' },
        { name: 'serviceCode', type: 'string' },
        { name: 'incoTermsCode', type: 'string' },
        { name: 'freightTermsCode', type: 'string' },
        { name: 'otherTermsCode', type: 'string' },
        { name: 'moduleTypeCode', type: 'string' },
        { name: 'boundTypeCode', type: 'string' },
        { name: 'carrierName', type: 'string' },
        { name: 'nominatedTypeCode', type: 'string' },
        { name: 'isDirect', type: 'boolean' },
        { name: 'isCoload', type: 'boolean' },

        { name: 'jobDate', type: 'Date' },
        { name: 'departureDateEstimated', type: 'Date' },
        { name: 'departureDateActual', type: 'Date' },
        { name: 'arrivalDateEstimated', type: 'Date' },
        { name: 'arrivalDateActual', type: 'Date' },

        { name: 'placeOfReceiptName', type: 'string' },
        { name: 'portOfLoadingName', type: 'string' },
        { name: 'portOfDischargeName', type: 'string' },
        { name: 'placeOfDeliveryName', type: 'string' },
        { name: 'finalDestinationName', type: 'string' },

        { name: 'officePartyName', type: 'string' },
        { name: 'shipperPartyName', type: 'string' },
        { name: 'consigneePartyName', type: 'string' },
        { name: 'linerAgentPartyName', type: 'string' },
        { name: 'roAgentPartyName', type: 'string' },
        { name: 'agentPartyName', type: 'string' },
        { name: 'controllingCustomerPartyName', type: 'string' },

        { name: 'id', type: 'string' },
        { name: 'shipId', type: 'string' },
        { name: 'haveCurrentTrackingNo', type: 'string' },
        { name: 'batchNumber', type: 'string' },
        { name: 'lastStatusCodeOrDescription', type: 'string' },
        { name: 'lastStatusDate', type: 'string' },
        { name: 'lastStatusWidget', type: 'string' },
        ...(dateNameList.reduce((total: any[], name: string) => {
          total.push({ name: `${name}DateEstimated`, type: 'Date' })
          total.push({ name: `${name}DateActual`, type: 'Date' })
          return total
        }, []))
      ],
    },
    'shipment'
  ),
})

export default query.toJson() */
