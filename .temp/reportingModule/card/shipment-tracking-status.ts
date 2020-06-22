import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  Query,
  ResultColumn,
  OrderBy,
  JoinClause,
  BinaryExpression,
  IsNullExpression,
  CreateFunctionJQL,
  InExpression,
  Value,
  GroupBy,
} from 'node-jql'

import { parseCode } from 'utils/function'

function prepareParams(): Function {

  const fn =  function(require, session, params) {

    // import
    const { moment } = params.packages

    // script
    const subqueries = params.subqueries || {}

    if (!subqueries.lastStatus || !subqueries.lastStatus.value)
      throw new Error('MISSING_lastStatus')

    subqueries.lastStatusJoin = true

    params.groupBy = ['lastStatus']
    params.fields = ['lastStatus', 'count']

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

function prepareFinalQuery() {
  const fn =  function(require, session, params) {

    const {
      ResultColumn,
      BinaryExpression,
      FunctionExpression,
      ColumnExpression,
      IsNullExpression,
      InExpression,
      Query,
      FromTable
     } = require('node-jql')

    const subqueries = params.subqueries || {}

    const lastStatusList = subqueries.lastStatus.value as string[]

    const $select = []

    lastStatusList.map(status => {
      $select.push(
        new ResultColumn(
          new FunctionExpression('IFNULL',
            new FunctionExpression('SUM',
              new FunctionExpression('IF', new BinaryExpression(new ColumnExpression('lastStatus'), '=', status), new ColumnExpression('count'), 0)
          ),
          0),
        `${status}_count`)
      )
    })

    return new Query({
      $select,
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            {
              name: 'count',
              type: 'number',
            },
            {
              name: 'lastStatus',
              type: 'string'
            }
          ],
        },
        'shipment'
      ),
    })
  }

  const code = fn.toString()
  return parseCode(code)
}

export default [

  [prepareParams(), prepareFinalQuery()]

]
