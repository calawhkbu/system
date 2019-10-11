import {
  AndExpressions,
  BinaryExpression,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  InsertJQL,
  Value,
  Query,
  ResultColumn,
  Column,
  LikeExpression,
  OrExpressions,
  GroupBy,
} from 'node-jql'

import { parseCode } from 'utils/function'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const types = ['GW', 'CW']

function prepareParams(likeHouseNo_: string): Function {

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
    // import
    const moment = require('moment')

    // limit/extend to 1 year
    const subqueries = (params.subqueries = params.subqueries || {})
    const year = (subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment()).year()
    const date = (subqueries.date = subqueries.date || {})
    date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // AE
    subqueries.moduleTypeCode = { value: 'AIR' }
    subqueries.boundTypeCode = { value: 'O' }

    // warning : hardCode
    subqueries.officePartyId = { value : 7351490 }

    // subqueries.billTypeCode = { value: 'M' }
    subqueries.reportingGroup = { value: ['AC', 'AD'] }

    subqueries.likeHouseNo = { value :  likeHouseNo_}

    // select
    params.fields = ['jobMonth', 'grossWeight', 'chargeableWeight']
    // group by
    params.groupBy = ['jobMonth']

    return params
  }

  let code = fn.toString()
  code = code.replace(new RegExp('likeHouseNo_', 'g'), `'${likeHouseNo_}'`)
  return parseCode(code)
}

function prepareFullTable(): CreateTableJQL {

  const tableName = 'full'
  return new CreateTableJQL({
    $temporary: true,
    name : tableName,
    columns: [
      new Column('officePartyName', 'string'),
      new Column('month', 'string'),
      new Column('grossWeight', 'number'),
      new Column('chargeableWeight', 'number'),

    ],
  })
}

function prepareData(hardCodeName: string): InsertJQL {
  return new InsertJQL({
    name: 'full',
    columns: ['officePartyName', 'month', 'grossWeight', 'chargeableWeight'],
    query: new Query({
      $select: [
        new ResultColumn(new Value(hardCodeName), 'officePartyName'),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn('grossWeight'),
        new ResultColumn('chargeableWeight'),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [

            { name: 'officePartyName', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'chargeableWeight', type: 'number' },
            { name: 'grossWeight', type: 'number' },
          ],
        },
        'shipment'
      ),

    }),
  })
}

function prepareUnionTable(): CreateTableJQL {

  const tableName = 'union'
  return new CreateTableJQL({
    $temporary: true,
    name: tableName,
    $as: new Query({

      $select : [
        new ResultColumn(new ColumnExpression('officePartyName')),
        new ResultColumn(new ColumnExpression('month')),
        new ResultColumn(new FunctionExpression('SUM', new ColumnExpression('chargeableWeight')), 'chargeableWeight'),
        new ResultColumn(new FunctionExpression('SUM', new ColumnExpression('grossWeight')), 'grossWeight'),
      ],

      $from : 'full',

      $group : new GroupBy(['officePartyName', 'month'])

    }),
  })
}

export default [

  prepareFullTable(),

  [prepareParams('GZH%'), prepareData('GGL GZH')],
  [prepareParams('XMN%'), prepareData('GGL XMN')],

  // prepareUnionTable(),

  prepareUnionTable(),

  // new Query({
  //   $from : 'union'
  // })

  // finalize data
  new Query({
    $select: [
      new ResultColumn('officePartyName'),
      ...months.reduce<ResultColumn[]>((result, month) => {
        result.push(
          ...types.map(
            type =>
              new ResultColumn(
                new FunctionExpression(
                  'IFNULL',

                  new FunctionExpression(
                    'FIND',
                    new BinaryExpression(new ColumnExpression('month'), '=', month),
                    new ColumnExpression(type === 'GW' ? 'grossWeight' : 'chargeableWeight')
                  ),
                  0
                ),

                `${month}-${type}`
              )
          )
        )
        return result
      }, []),
    ],
    $from: 'union',
    $group: 'officePartyName',
  }),

]
