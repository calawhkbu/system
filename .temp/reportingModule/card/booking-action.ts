import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  BetweenExpression,
  FunctionExpression,
  BinaryExpression,
  GroupBy,
  Query,
  ResultColumn,
  Column,
  InsertJQL,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')
    const { moment } = params.packages

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    // hardcode testing
    subqueries.createdAt = {
      from: moment().subtract(10, 'days'),
      to: moment(),
    }

    subqueries.entityType = {
      value: 'booking',
    }

    return params
  }
}

function prepareBookingTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
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
            { name: 'lastStatus', type: 'string' },
            { name: 'lastStatusDate', type: 'string' },
          ],
        },
        name
      ),
    }),
  })
}

function prepareWorkflowQuery() {
  const fn = async function(require, session, params) {
    const { Resultset } = require('node-jql-core')
    const {
      ColumnExpression,
      CreateTableJQL,
      FromTable,
      InExpression,
      BetweenExpression,
      FunctionExpression,
      BinaryExpression,
      GroupBy,
      Query,
      ResultColumn,
    } = require('node-jql')

    const bookings = new Resultset(await session.query(new Query('booking'))).toArray()

    return new CreateTableJQL({
      $temporary: true,
      name: 'workflow',
      $as: new Query({
        $from: new FromTable(
          {
            method: 'POST',
            data: bookings,
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
                type: 'date',
              },
            ],
          },
          'workflow'
        ),
      }),
    })
  }

  const code = fn.toString()
  return parseCode(code)
}

function createNextStatusTable(): CreateTableJQL {
  return new CreateTableJQL(true, 'nextStatus', [
    new Column('tableName', 'string'),
    new Column('primaryKey', 'number'),
    new Column('statusName', 'string'),
    new Column('expiryDate', 'date', true),
    new Column('expired', 'boolean'),
  ])
}

function insertNextStatusTable() {
  const fn = async function(require, session, params) {
    const { Resultset } = require('node-jql-core')
    const { InsertJQL, Query } = require('node-jql')
    const { moment } = params.packages

    const result = [] as any[]

    const workflowList = new Resultset(
      await session.query(new Query('workflow'))
    ).toArray() as any[]

    workflowList.forEach(workflow => {
      const expiryDate = moment(workflow.expiryDate)

      let expired = false
      if (expiryDate && expiryDate != null) {
        if (moment().diff(expiryDate) > 0) {
          expired = true
        }
      }

      result.push({
        expired,
        ...workflow,
      })
    })

    return new InsertJQL('nextStatus', ...result)
  }

  const code = fn.toString()
  return parseCode(code)
}

export default [
  [prepareParams(), prepareBookingTable('booking')],

  // get the expireDate from API
  prepareWorkflowQuery(),

  // insert the api result into table
  createNextStatusTable(),
  insertNextStatusTable(),

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('nextStatus', 'statusName')),
      new ResultColumn(new ColumnExpression('nextStatus', 'statusName')),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'SUM',
            new FunctionExpression('if', new ColumnExpression('nextStatus', 'expired'), 1, 0)
          ),
          0
        ),
        'expiredTotal'
      ),
      new ResultColumn(
        new FunctionExpression('COUNT', new ColumnExpression('nextStatus', 'primaryKey')),
        'total'
      ),
      new ResultColumn(
        new FunctionExpression('GROUP_CONCAT', new ColumnExpression('nextStatus', 'primaryKey')),
        'primaryKeyListString'
      ),
    ],

    $from: 'nextStatus',

    $group: new GroupBy(new ColumnExpression('nextStatus', 'statusName')),
  }),
]
