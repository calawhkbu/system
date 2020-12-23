import { IQueryParams } from 'classes/query'
import { JqlDefinition } from 'modules/report/interface'
import moment = require('moment')

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
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        if (params.subqueries && params.subqueries.myTasksOnly) {
          // user info
          params.subqueries.sop_user = { value: user.username }
          params.subqueries.sop_partyGroupCode = { value: user.selectedPartyGroup.code }

          // teams
          if (!user.selectedRoles.find(r => r.roleName === 'SWIVEL_ADMIN' || r.roleName === 'SOP_TASK_MANAGER')) {
            params.subqueries.sop_teams = { value: user.teams }
          }

          // user's today
          const { timezone } = user.configuration
          params.subqueries.sop_today = {
            from: moment.tz(timezone).startOf('d').utc().format('YYYY-MM-DD HH:mm:ss'),
            to: moment.tz(timezone).endOf('d').utc().format('YYYY-MM-DD HH:mm:ss')
          }
        }

        if (params.subqueries && params.subqueries.sopScore) {
          if (params.subqueries.sopScore.from === 0 && params.subqueries.sopScore.to === 100) {
            delete params.subqueries.sopScore
          }
        }

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment']
    }
  ],
  columns: [
    { key: 'createdAt' },
    { key: 'updatedAt' },
    { key: 'houseNo' },
    { key: 'jobNo' },
    { key: 'masterNo' },
    { key: 'bookingNo' },
    { key: 'poNos' },
    { key: 'carrierBookingNos' },
    { key: 'containerNos' },
    { key: 'contractNos' },
    { key: 'commodity' },
    { key: 'vessel' },
    { key: 'voyageFlightNumber' },
    { key: 'divisionCode' },
    { key: 'serviceCode' },
    { key: 'shipmentTypeCode' },
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
    { key: 'cargoReadyDateEstimated' },
    { key: 'cargoReadyDateActual' },
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
    { key: 'picId' },
    { key: 'picEmail' },
    { key: 'team' },
    { key: 'haveCurrentTrackingNo' },
    { key: 'batchNumber' },
    { key: 'lastStatusCodeOrDescription' },
    { key: 'lastStatusDate' },
    { key: 'lastStatusWidget' },
    { key: 'createdBy' },
    { key: 'updatedBy' },
    { key: 'activeStatus' },
    ...documentFileNameList.map(documentFileName => {

      return { key: `haveDocument_${documentFileName}` }

    })


  ]
} as JqlDefinition
