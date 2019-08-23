import { BinaryExpression, ColumnExpression, FunctionExpression, Query } from 'node-jql'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')
    const moment = require('moment')

    // script
    const subqueries = params.subqueries || {}
    if (!subqueries.date) throw new BadRequestException('MISSING_DATE')
    const datefr = moment(subqueries.date.from, 'YYYY-MM-DD')
    const dateto = moment(subqueries.date.to, 'YYYY-MM-DD')
    if (dateto.diff(datefr, 'months', true) > 1)
      throw new BadRequestException('DATE_RANGE_TOO_LARGE')
    if (!subqueries.boundType) throw new BadRequestException('MISSING_BOUND_TYPE')
    if (!subqueries.lastStatus) throw new BadRequestException('MISSING_LAST_STATUS')
    return params
  }
}

export default [
  // prepare tables
  [
    prepareParams(),
    function(require, session, params) {
      // import
      const { CreateTableJQL, FromTable, Query } = require('node-jql')

      // script
      const subqueries = params.subqueries || {}
      return new CreateTableJQL({
        $temporary: true,
        name: 'status_master',
        $as: new Query({
          $from: new FromTable(
            {
              url: `api/statusMaster/query/shipment-tracking-flow-${
                subqueries.boundType.value === 'O' ? 'export' : 'import'
              }`,
              columns: [{ name: 'group', type: 'string' }],
            },
            'status_master'
          ),
        }),
      })
    },
  ],
  function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')
    const {
      AndExpressions,
      BetweenExpression,
      BinaryExpression,
      CaseExpression,
      ColumnExpression,
      CreateTableJQL,
      FromTable,
      IsNullExpression,
      ParameterExpression,
      Query,
      ResultColumn,
    } = require('node-jql')

    const subqueries = params.subqueries || {}
    const cases = [] as any[]

    // not yet received
    if (subqueries.notYetReceived) {
      cases.push({
        $when: new AndExpressions([
          new IsNullExpression(new ColumnExpression('cargoReceiptActualDate'), false),
          new IsNullExpression(new ColumnExpression('cargoReadyActualDate'), true),
          new BetweenExpression(
            new ColumnExpression('cargoReadyActualDate'),
            false,
            new FunctionExpression(
              'DATE_SUB',
              new FunctionExpression('NOW'),
              new ParameterExpression({
                prefix: 'INTERVAL',
                expression: subqueries.notYetReceived.value,
                suffix: 'HOUR',
              })
            ),
            new FunctionExpression('NOW')
          ),
        ]),
        $then: 'notYetReceived',
      })
    }

    // not yet departed
    if (subqueries.notYetDeparted) {
      cases.push({
        $when: new AndExpressions([
          new IsNullExpression(new ColumnExpression('transactionActualDepatureDate'), false),
          new IsNullExpression(new ColumnExpression('calcuatedEstimatedDepatureDate'), true),
          new BetweenExpression(
            new ColumnExpression('calcuatedEstimatedDepatureDate'),
            false,
            new FunctionExpression(
              'DATE_SUB',
              new FunctionExpression('NOW'),
              new ParameterExpression({
                prefix: 'INTERVAL',
                expression: subqueries.notYetDeparted.value,
                suffix: 'HOUR',
              })
            ),
            new FunctionExpression('NOW')
          ),
        ]),
        $then: 'notYetDeparted',
      })
    }

    // late departures
    if (subqueries.lateDepartures && subqueries.lateDeparturesAlert) {
      cases.push({
        $when: new AndExpressions([
          new IsNullExpression(new ColumnExpression('transactionActualDepatureDate'), true),
          new BetweenExpression(
            new ColumnExpression('transactionActualDepatureDate'),
            false,
            new FunctionExpression(
              'DATE_SUB',
              new FunctionExpression('NOW'),
              new ParameterExpression({
                prefix: 'INTERVAL',
                expression: subqueries.lateDepartures.value,
                suffix: 'HOUR',
              })
            ),
            new FunctionExpression('NOW')
          ),
          new BinaryExpression(
            new FunctionExpression(
              'TIMESTAMPDIFF',
              'HOUR',
              new ColumnExpression('calcuatedEstimatedDepatureDate'),
              new ColumnExpression('transactionActualArrivalDate')
            ),
            '>',
            subqueries.lateDeparturesAlert.value
          ),
        ]),
        $then: 'lateDepartures',
      })
    } else if (subqueries.lateDepartures || subqueries.lateDeparturesAlert) {
      throw new BadRequestException('BAD_PARAMS_FOR_LATE_DEPARTURES')
    }

    // not yet arrived
    if (subqueries.notYetArrived) {
      cases.push({
        $when: new AndExpressions([
          new IsNullExpression(new ColumnExpression('transactionActualDepatureDate'), true),
          new IsNullExpression(new ColumnExpression('transactionActualArrivalDate'), false),
          new IsNullExpression(new ColumnExpression('calcuatedEstimatedArrivalDate'), true),
          new BetweenExpression(
            new ColumnExpression('calcuatedEstimatedArrivalDate'),
            false,
            new FunctionExpression(
              'DATE_SUB',
              new FunctionExpression('NOW'),
              new ParameterExpression({
                prefix: 'INTERVAL',
                expression: subqueries.notYetArrived.value,
                suffix: 'HOUR',
              })
            ),
            new FunctionExpression('NOW')
          ),
        ]),
        $then: 'notYetArrived',
      })
    }

    // late arrivals
    if (subqueries.lateArrivals && subqueries.lateArrivalsAlert) {
      cases.push({
        $when: new AndExpressions([
          new IsNullExpression(new ColumnExpression('transactionActualDepatureDate'), true),
          new IsNullExpression(new ColumnExpression('transactionActualArrivalDate'), false),
          new BetweenExpression(
            new ColumnExpression('transactionActualArrivalDate'),
            false,
            new FunctionExpression(
              'DATE_SUB',
              new FunctionExpression('NOW'),
              new ParameterExpression({
                prefix: 'INTERVAL',
                expression: subqueries.lateArrivals.value,
                suffix: 'HOUR',
              })
            ),
            new FunctionExpression('NOW')
          ),
          new BinaryExpression(
            new FunctionExpression(
              'TIMESTAMPDIFF',
              'HOUR',
              new ColumnExpression('calcuatedEstimatedArrivalDate'),
              new ColumnExpression('transactionActualArrivalDate')
            ),
            '>',
            subqueries.lateArrivalsAlert.value
          ),
        ]),
        $then: 'lateArrivals',
      })
    } else if (subqueries.lateDepartures || subqueries.lateDeparturesAlert) {
      throw new BadRequestException('BAD_PARAMS_FOR_LATE_ARRIVALS')
    }

    return new CreateTableJQL({
      $temporary: true,
      name: 'shipment',
      $as: new Query({
        $select: [new ResultColumn('*'), new ResultColumn(new CaseExpression(cases), 'group')],
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns: [
              // TODO
            ],
          },
          'shipment'
        ),
      }),
    })
  },

  // finalize
  function(require, session, params) {
    return new Query({
      $from: 'shipment',
      $where: new BinaryExpression(
        new ColumnExpression('group'),
        '=',
        params.subqueries.lastStatus.value
      ),
    })
  },
]
