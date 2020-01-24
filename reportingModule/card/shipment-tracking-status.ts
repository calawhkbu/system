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

const lastStatusCodeMapString = JSON.stringify({

  // left side is called laststatus
  // right side is called lastStatusCode

  notInTrack: [null, 'NEW', 'CANF', 'ERR'],
  processing: ['BKCF', 'EPRL', 'STSP', 'BKD'],
  cargoReady: ['GITM', 'LOBD', 'RCS', 'MNF', 'MAN'],
  departure: ['DLPT', 'DEP'],
  inTransit: ['TSLB', 'TSDC', 'TAP', 'TDE'],
  arrival: ['BDAR', 'DSCH', 'DECL', 'PASS', 'TMPS', 'ARR', 'RWB', 'RCF', 'CUS', 'NFD'],
  delivered: ['STCS', 'RCVE', 'END', 'DLV']

})

function prepareParamsOld(lastStatusCodeMapString_: string): Function {

  const fn =  function(require, session, params) {

    // import
    const moment = require('moment')

    // script
    const subqueries = params.subqueries || {}

    if (!subqueries.lastStatus || !subqueries.lastStatus.value)
      throw new Error('MISSING_lastStatus')

    // lastStatusList case
    if (subqueries.lastStatus) {
      if (!(subqueries.lastStatus.value && subqueries.lastStatus.value.length) )
        throw new Error('MISSING_lastStatus')

      const lastStatusList = subqueries.lastStatus.value
      const lastStatusCodeMap = JSON.parse(lastStatusCodeMapString_)

      // compose the subqueries of lastStatusCode
      let lastStatusCodeList = []

      subqueries['lastStatusCodeJoin'] = true

      lastStatusList.forEach(status => {
        lastStatusCodeList = lastStatusCodeList.concat(lastStatusCodeMap[status] || [])
      })

      if (lastStatusList.includes('notInTrack')) {
        subqueries.lastStatusCodeIncludeNull = { value: lastStatusCodeList }
      }

      else {
        subqueries.lastStatusCode = { value: lastStatusCodeList }
      }

    }

    params.groupBy = ['lastStatusCode']
    params.fields = ['lastStatusCode', 'count']

    return params
  }

  let code = fn.toString()
  code = code.replace(new RegExp('lastStatusCodeMapString_', 'g'), `'${lastStatusCodeMapString_}'`)
  return parseCode(code)
}

function prepareParams(): Function {

  const fn =  function(require, session, params) {

    // import
    const moment = require('moment')

    // script
    const subqueries = params.subqueries || {}

    if (!subqueries.lastStatus || !subqueries.lastStatus.value)
      throw new Error('MISSING_lastStatus')

    subqueries.lastStatusCodeJoin = true

    params.groupBy = ['lastStatus']
    params.fields = ['lastStatus', 'count']

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

function prepareFinalQueryOld(lastStatusCodeMapString_) {
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

    function composeStatusFunction(statusCodeMap) {

      const base = new FunctionExpression('IF', new IsNullExpression(new ColumnExpression('lastStatusCode'), false), 'notInTrack', new ColumnExpression('lastStatusCode'))

      let dumb = base as any

      for (const status in statusCodeMap) {
        if (statusCodeMap.hasOwnProperty(status)) {
          const statusCodeList = statusCodeMap[status]
          dumb = new FunctionExpression('IF', new InExpression(new ColumnExpression('lastStatusCode'), false, statusCodeList), status, dumb)
        }
      }

      return dumb

    }

    const statusCodeMap = JSON.parse(lastStatusCodeMapString_)

    const statusExpression = composeStatusFunction(statusCodeMap)

    const $select = []

    lastStatusList.map(status => {
      $select.push(
        new ResultColumn(
          new FunctionExpression('IFNULL',
            new FunctionExpression('SUM',
              new FunctionExpression('IF', new BinaryExpression(statusExpression, '=', status), new ColumnExpression('count'), 0)
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
              name: 'lastStatusCode',
              type: 'string'
            },
          ],
        },
        'shipment'
      ),
    })
  }

  let code = fn.toString()
  code = code.replace(new RegExp('lastStatusCodeMapString_', 'g'), `'${lastStatusCodeMapString_}'`)
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

  // [prepareParamsOld(lastStatusCodeMapString), prepareFinalQueryOld(lastStatusCodeMapString)]

  [prepareParams(), prepareFinalQuery()]

]
