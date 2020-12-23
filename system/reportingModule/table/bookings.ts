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
  'Quotation',
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
      dataServiceQuery: ['booking', 'booking']
    }
  ],
  columns: [
    { key: 'createdAt' },
    { key: 'updatedAt' },
    { key: 'id' },
    { key: 'shipId' },
    { key: 'shipmentId' },
    { key: 'houseNo' },
    { key: 'masterNo' },
    { key: 'poNo' },
    { key: 'bookingNo' },
    { key: 'moduleType' }, //need this
    { key: 'boundType' },
    { key: 'shipmentType' },
    { key: 'service' },
    { key: 'incoTermsCode' },
    { key: 'freightTerms' },
    { key: 'otherTerms' },
    { key: 'finalVesselName' },
    { key: 'finalVoyageFlightNumber' },
    { key: 'commodity' },
    { key: 'picId' },
    { key: 'picEmail' },
    { key: 'team' },
    { key: 'polHScode' },
    { key: 'placeOfReceiptName' },
    { key: 'portOfLoadingName' },
    { key: 'portOfDischargeName' },
    { key: 'placeOfDeliveryName' },
    { key: 'finalDestinationName' },
    { key: 'carrierName' },
    { key: 'cargoReadyDateEstimated' },
    { key: 'cargoReadyDateActual' },
    { key: 'cargoReadyDateRemark' },
    { key: 'shipperInstructionSubmitDateEstimated' },
    { key: 'shipperInstructionSubmitDateActual' },
    { key: 'shipperInstructionSubmitDateRemark' },
    { key: 'bookingSubmitDateEstimated' },
    { key: 'bookingSubmitDateActual' },
    { key: 'bookingSubmitDateRemark' },
    { key: 'cYCutOffDateEstimated' },
    { key: 'cYCutOffDateActual' },
    { key: 'cYCutOffDateRemark' },
    { key: 'customClearanceLoadingPortDateEstimated' },
    { key: 'customClearanceLoadingPortDateActual' },
    { key: 'customClearanceLoadingPortDateRemark' },
    { key: 'departureDateEstimated' },
    { key: 'departureDateActual' },
    { key: 'departureDateRemark' },
    { key: 'arrivalDateEstimated' },
    { key: 'arrivalDateActual' },
    { key: 'arrivalDateRemark' },
    { key: 'customClearanceDestinationPortDateEstimated' },
    { key: 'customClearanceDestinationPortDateActual' },
    { key: 'customClearanceDestinationPortDateRemark' },
    { key: 'finalDoorDeliveryDateEstimated' },
    { key: 'finalDoorDeliveryDateActual' },
    { key: 'finalDoorDeliveryDateRemark' },
    { key: 'createdUserEmail' },
    { key: 'updatedUserEmail' },
    { key: 'shipperPartyCode' },
    { key: 'shipperPartyName' },
    { key: 'shipperPartyContactEmail' },
    { key: 'shipperPartyContactName' },
    { key: 'consigneePartyCode' },
    { key: 'consigneePartyName' },
    { key: 'consigneePartyContactEmail' },
    { key: 'consigneePartyContactName' },
    { key: 'forwarderPartyName' },
    { key: 'forwarderPartyCode' },
    { key: 'forwarderPartyContactEmail' },
    { key: 'forwarderPartyContactName' },
    { key: 'notifyPartyPartyCode' },
    { key: 'notifyPartyPartyName' },
    { key: 'notifyPartyPartyContactEmail' },
    { key: 'notifyPartyPartyContactName' },
    { key: 'agentPartyCode' },
    { key: 'agentPartyName' },
    { key: 'agentPartyContactEmail' },
    { key: 'agentPartyContactName' },
    { key: 'controllingCustomerPartyCode' },
    { key: 'controllingCustomerPartyName' },
    { key: 'controllingCustomerPartyContactEmail' },
    { key: 'controllingCustomerPartyContactName' },
    { key: 'roAgentPartyCode' },
    { key: 'roAgentPartyName' },
    { key: 'roAgentPartyContactEmail' },
    { key: 'roAgentPartyContactName' },
    { key: 'linerAgentPartyCode' },
    { key: 'linerAgentPartyName' },
    { key: 'linerAgentPartyContactEmail' },
    { key: 'linerAgentPartyContactName' },
    { key: 'controllingPartyPartyCode' },
    { key: 'controllingPartyPartyName' },
    { key: 'controllingPartyPartyContactEmail' },
    { key: 'controllingPartyPartyContactName' },
    { key: 'containerTypeCode' },
    { key: 'allSoNo' },
    { key: 'allContainerNo' },
    { key: 'totalQuantity' },
    { key: 'totalQuantityUnit' },
    { key: 'bookingGrossWeight' },
    { key: 'bookingChargeableWeight' },
    { key: 'bookingVolumeWeight' },
    { key: 'bookingWeightUnit' },
    { key: 'bookingCbm' },
    { key: 'shipMarks' },
    { key: 'goodsDescription' },
    { key: 'remark' },
    { key: 'specialInstruction' },
    { key: 'lastStatusCodeOrDescription' },
    { key: 'lastStatusDate' },
    { key: 'lastStatusWidget' },
    { key: 'createdBy' },
    { key: 'updatedBy' },
    { key: 'activeStatus' },
    { key: 'haveCurrentTrackingNo' },
    ...documentFileNameList.map(documentFileName => {

      return { key: `haveDocument_${documentFileName}` }

    })
  ],
} as JqlDefinition
