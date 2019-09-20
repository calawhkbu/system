import {
  BinaryExpression,
  Column,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  InsertJQL,
  Query,
  ResultColumn,
  Value,
} from 'node-jql'

const months = [
  'Total',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'Auguest',
  'September',
  'Octomber',
  'November',
  'December',
]
const types = ['F', 'R', 'C']

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const moment = require('moment')

    // limit/extend to 1 year
    const subqueries = (params.subqueries = params.subqueries || {})
    const year = (subqueries.data ? moment() : moment(subqueries.date.from, 'YYYY-MM-DD')).year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // AE
    subqueries.moduleType = { value: 'AIR' }
    subqueries.boundType = { value: 'O' }

    // select
    params.fields = ['carrierCode', 'jobMonth', 'COUNT(id)']

    // group by
    params.groupBy = ['carrierCode', 'jobMonth']

    return params
  }
}

// call API
function prepareData(): InsertJQL {
  return new InsertJQL({
    name: 'shipment',
    columns: ['carrierCode', 'month', 'noOfShipments'],
    query: new Query({
      $select: [
        new ResultColumn('carrierCode'),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn('noOfShipments'),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            { name: 'carrierCode', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'COUNT(id)', type: 'number', $as: 'noOfShipments' },
          ],
        },
        'shipment'
      ),
    }),
  })
}

// prepare Total row(s)
function prepareTotal(): InsertJQL {
  return new InsertJQL({
    name: 'shipment',
    columns: ['carrierCode', 'month', 'noOfShipments'],
    query: new Query({
      $select: [
        new ResultColumn('carrierCdoe'),
        new ResultColumn(new Value('Total'), 'month'),
        new ResultColumn(
          new FunctionExpression('SUM', new ColumnExpression('noOfShipments')),
          'noOfShipments'
        ),
      ],
      $from: 'shipment',
      $group: 'carrierCode',
    }),
  })
}

export default [
  // prepare temp table
  new CreateTableJQL(true, 'shipment', [
    new Column('carrierCode', 'string'),
    new Column('month', 'string'),
    new Column('noOfShipments', 'number'),
  ]),

  // prepare data
  [prepareParams(), prepareData()],
  prepareTotal(),

  // finalize data
  new Query({
    $select: [
      new ResultColumn('carrierCode'),
      ...months.reduce<ResultColumn[]>((result, month) => {
        result.push(
          ...types.map(
            type =>
              new ResultColumn(
                new FunctionExpression(
                  'FIND',
                  new BinaryExpression(new ColumnExpression('month'), '=', month),
                  new ColumnExpression('noOfShipments')
                ),
                `${month}-${type}`
              )
          )
        )
        return result
      }, []),
    ],
    $from: 'shipment',
    $group: 'carrierCode',
  }),
]
