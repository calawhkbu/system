import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import moment = require('moment')
import { BadRequestException } from '@nestjs/common'

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

        const { timezone } = user.configuration
        if (params.subqueries.date) {
          params.subqueries.sop_date = params.subqueries.date
          delete params.subqueries.date
        }

        if (!params.subqueries.sop_date || rangeTooLarge(params.subqueries.sop_date)) {
          throw new BadRequestException('SOP_DATE_RANGE_TOO_LARGE')
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
    { key: 'updatedAt' },
    { key: 'id' },
    { key: 'houseNo' },
    { key: 'masterNo' },
    { key: 'poNo' },
    { key: 'bookingNo' },
    { key: 'moduleType' },
    { key: 'boundType' },
    { key: 'service' },
    { key: 'incoTerms' },
    { key: 'freightTerms' },
    { key: 'otherTerms' },
    { key: 'vesselName' },
    { key: 'voyageFlightNumber' },
    { key: 'commodity' },
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
    { key: 'cYCutOffDateEstimated' },
    { key: 'cYCutOffDateActual' },
    { key: 'cYCutOffDateRemark' },
    { key: 'departureDateEstimated' },
    { key: 'departureDateActual' },
    { key: 'departureDateRemark' },
    { key: 'arrivalDateEstimated' },
    { key: 'arrivalDateActual' },
    { key: 'arrivalDateRemark' },
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
    { key: 'noOfTasks' },
    { key: 'sopScore' },
    { key: 'team' },
    { key: 'picEmail' },
    { key: 'createdAt' }
  ],
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

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
          name: 'houseNo',
          type: 'string',
        },

        {
          name: 'masterNo',
          type: 'string',
        },
        {
          name: 'poNo',
          type: 'string',
        },

        {
          name: 'bookingNo',
          type: 'string',
        },
        {
          name: 'moduleType',
          type: 'string',
        },
        {
          name: 'boundType',
          type: 'string',
        },
        {
          name: 'service',
          type: 'string',
        },
        {
          name: 'incoTerms',
          type: 'string',
        },
        {
          name: 'freightTerms',
          type: 'string',
        },
        {
          name: 'otherTerms',
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
          name: 'placeOfReceiptName',
          type: 'string',
        },
        {
          name: 'portOfLoadingName',
          type: 'string',
        },
        {
          name: 'portOfDischargeName',
          type: 'string',
        },
        {
          name: 'placeOfDeliveryName',
          type: 'string',
        },
        {
          name: 'finalDestinationName',
          type: 'string',
        },
        {
          name: 'carrierName',
          type: 'string',
        },
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

export default query.toJson() */

function rangeTooLarge(date: { from: string, to: string }): boolean {
  const datefr = moment.utc(date.from, 'YYYY-MM-DD')
  const dateto = moment.utc(date.to, 'YYYY-MM-DD')
  return dateto.diff(datefr, 'years', true) > 1
}
