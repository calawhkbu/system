import {
  BinaryExpression,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  GroupBy,
  Query,
  ResultColumn,
  JoinClause,
} from 'node-jql'
import { Session } from 'node-jql-core'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})
    if (!subqueries.entityType) throw new BadRequestException('MISSING_ENTITY_TYPE')
    if (['booking', 'purchase-order'].indexOf(subqueries.entityType.value) === -1)
      throw new BadRequestException(
        `INVALID_ENTITY_TYPE_${String(subqueries.type.value).toLocaleUpperCase()}`
      )
    if (!subqueries.date) throw new BadRequestException('MISSING_DATE')
    if (!subqueries.moduleTypeCode) throw new BadRequestException('MISSING_MODULE_TYPE_CODE')
    return params
  }
}

export default [
  [
    prepareParams(),
    new CreateTableJQL({
      $temporary: true,
      name: 'booking',
      $as: new Query({
        $select: [],
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/booking/query/booking',
            columns: [
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
              {
                name: 'podHScode',
                type: 'string',
              },
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
              {
                name: 'finalDestinationCode',
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
      }),
    }),
  ],
  async function(require, session: Session, params) {
    // import
    const { CreateTableJQL, FromTable, Query } = require('node-jql')
    const { Resultset } = require('node-jql-core')

    const bookings = new Resultset(await session.query(new Query('booking'))).toArray()
    return new CreateTableJQL({
      $temporary: true,
      name: 'workflow',
      $as: new Query({
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/workflow/booking/next',
            columns: [
              {
                name: 'tableName',
                type: 'string',
              },
              {
                name: 'primaryKey',
                type: 'number',
              },
              {
                name: 'statusName',
                type: 'string',
              },
              {
                name: 'expiryDate',
                type: 'string',
              },
            ],
          },
          'workflow'
        ),
      }),
    })
  },

  // test
  new Query({
    $from: new FromTable(
      'booking',
      new JoinClause(
        'LEFT',
        'workflow',
        new BinaryExpression(
          new ColumnExpression('booking', 'id'),
          '=',
          new ColumnExpression('workflow', 'primaryKey')
        )
      )
    ),
  }),
]
