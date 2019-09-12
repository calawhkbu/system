import {
    Query,
    FromTable,
    CreateTableJQL,
    GroupBy,
    ResultColumn,
    ColumnExpression,
    FunctionExpression,
    AndExpressions,
    BinaryExpression,
    InsertJQL,
    Column,
    JoinClause,
    IConditionalExpression,
    InExpression,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(): Function {
    const fn = function(require, session, params) {
        const moment = require('moment')
        const subqueries = (params.subqueries = params.subqueries || {})

        if (subqueries.date) {
            // get the year part of the "from date"

            // reset the date.from and date.to depending on date.from YEAR
            subqueries.date.from = moment()
                .month()
                .startOf('month')
                .format('YYYY-MM-DD')
            subqueries.date.to = moment()
                .month()
                .endOf('month')
                .format('YYYY-MM-DD')
        }

        return params
    }
    const code = fn.toString()
    return parseCode(code)
}

function prepareMonthTotalTable(name: string): CreateTableJQL {
    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query({
            $select: [
                new ResultColumn(new ColumnExpression(name, 'reportingGroup')),
                new ResultColumn(new ColumnExpression(name, 'jobMonth')),
                new ResultColumn(new ColumnExpression(name, 'moduleType')),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',

                        new FunctionExpression('IF',

                            // if air , user chargeable weight
                            new BinaryExpression(new ColumnExpression(name, 'moduleType'), '=', 'AIR'),
                            new FunctionExpression('SUM', new ColumnExpression(name, 'chargeableWeight')),

                            // warning : in reportingGroup == ['SA', 'SR'] use teu
                            new FunctionExpression('IF', new InExpression(new ColumnExpression(name, 'reportingGroup'), false, ['SA', 'SR']),

                                new FunctionExpression('SUM', new ColumnExpression(name, 'teu')),

                                //
                                new FunctionExpression('SUM', new ColumnExpression(name, 'cbm')))

                        ),
                        0
                    ),
                    'monthTotal'
                ),
            ],
            $from: new FromTable(
                {
                    method: 'POST',
                    url: 'api/shipment/query/shipment',
                    columns: [

                        {
                            name: 'reportingGroup',
                            type: 'string',
                        },
                        {
                            name: 'moduleType',
                            type: 'string',
                        },
                        {
                            name: 'chargeableWeight',
                            type: 'number',
                        },
                        {
                            name: 'cbm',
                            type: 'number',
                        },
                        {
                            name: 'grossWeight',
                        },
                        {
                            name: 'teu',
                        },
                        {
                            name: 'jobMonth',
                            type: 'string',
                        },
                    ],

                    data: {
                        subqueries: {
                            jobMonth: true,
                        },
                        // include jobMonth from the table
                        fields: ['jobMonth', 'shipment.*'],
                    },
                },
                name
            ),
            $group: new GroupBy([
                new ColumnExpression(name, 'reportingGroup'),
                new ColumnExpression(name, 'jobMonth'),
            ]),
        }),
    })
}

function prepareMonthTable(name: string): CreateTableJQL {

    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query({
            $select: [

                new ResultColumn(new ColumnExpression('tempTable', 'reportingGroup'), 'reportingGroup'),
                new ResultColumn(new ColumnExpression('tempTable', 'moduleType'), 'moduleType'),

                // hard code 12 months
                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'SUM', new ColumnExpression('tempTable', 'monthTotal')

                        ),
                        0
                    ),
                    'total'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'January'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Jan'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'February'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Feb'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'March'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Mar'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'April'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Apr'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'May'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'May'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'June'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Jun'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'July'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Jul'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',
                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'August'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Aug'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'September'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Sep'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'October'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Oct'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'November'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Nov'
                ),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',

                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression('tempTable', 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    'December'
                                ),
                                new BinaryExpression(
                                    new ColumnExpression('tempTable', 'reportingGroup'),
                                    '=',
                                    new ColumnExpression('reportingGroup')
                                ),
                            ]),
                            new ColumnExpression('monthTotal')
                        ),
                        0
                    ),
                    'Dec'
                ),

            ],

            $from: 'tempTable',

            $group: 'reportingGroup',
        }),
    })

}

function prepareCodeMasterParams(): Function {

    const fn = function(require, session, params) {
      const subqueries = (params.subqueries = params.subqueries || {})

      subqueries.codeType = {
        value : 'reportingGroup'
      }

      return params
    }
    const code = fn.toString()
    return parseCode(code)

  }

  function prepareCodeMasterTable(name: string): CreateTableJQL {

    return new CreateTableJQL({

      $temporary: true,
      name,

      $as: new Query({
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/code/query/code_master',
            columns: [
              {
                name: 'id',
                type: 'number',
              },
              {
                name: 'code',
                type: 'string',
              },
              {
                name: 'codeType',
                type: 'string',
              },
            ],
          },
          name
        )
      }),

    })

  }

  function preparefinalTable(name: string)
  {

    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query({

            $select: [

                new ResultColumn(new ColumnExpression('code_master', 'code'), 'reportingGroup'),
                new ResultColumn(new ColumnExpression('month', 'moduleType'), 'moduleType'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'total'), 0), 'total'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Jan'), 0), 'Jan'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Feb'), 0), 'Feb'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Mar'), 0), 'Mar'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Apr'), 0), 'Apr'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'May'), 0), 'May'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Jun'), 0), 'Jun'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Jul'), 0), 'Jul'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Aug'), 0), 'Aug'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Sep'), 0), 'Sep'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Oct'), 0), 'Oct'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Nov'), 0), 'Nov'),
                new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Dec'), 0), 'Dec'),

            ],

            $from: new FromTable(
                'code_master', new JoinClause(
                    'LEFT',
                    'month',
                    new BinaryExpression(new ColumnExpression('code_master', 'code'), '=', new ColumnExpression('month', 'reportingGroup'))
            ))

        })
    })

  }

// question : should use all reportingGroup or what??
export default [

    [prepareParams(), prepareMonthTotalTable('tempTable')],
    prepareMonthTable('month'),
    [prepareCodeMasterParams(), prepareCodeMasterTable('code_master')],

    preparefinalTable('final'),

    new Query({

        $select: [

            new ResultColumn(new ColumnExpression('final', 'moduleType'), '__id'),
            new ResultColumn(new ColumnExpression('final', 'moduleType'), '__value'),
            new ResultColumn(new FunctionExpression('ROWS', new ColumnExpression('*')), '__rows'),
        ],

        $from: 'final',

        $group: new GroupBy(new ColumnExpression('final', 'moduleType'))

    })

]
