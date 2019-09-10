import {
    Query,
    FromTable,
    CreateTableJQL,
    ResultColumn,
    ColumnExpression,
    FunctionExpression,
    GroupBy,
    BinaryExpression,
    AndExpressions,
    IsNullExpression,
} from 'node-jql'
import { parseCode } from 'utils/function'
import { stringify } from 'querystring'

    const monthMap = new Map<string, string>(
        [
            ['Jan', 'January'],
            ['Feb', 'February'],
            ['Mar', 'March'],
            ['Apr', 'April'],
            ['May', 'May'],
            ['Jun', 'June'],
            ['Jul', 'July'],
            ['Aug', 'August'],
            ['Sep', 'September'],
            ['Oct', 'October'],
            ['Nov', 'November'],
            ['Dec', 'December'],

        ]
    )

function prepareParams(): Function {
    const fn = function(require, session, params) {
        const moment = require('moment')
        const subqueries = (params.subqueries = params.subqueries || {})
        if (subqueries.date) {
            // get the year part of the "from date"
            const year = moment(subqueries.date.from, 'YYYY-MM-DD').year()

            // reset the date.from and date.to depending on date.from YEAR
            subqueries.date.from = moment()
                .year(year)
                .startOf('year')
                .format('YYYY-MM-DD')
            subqueries.date.to = moment()
                .year(year)
                .endOf('year')
                .format('YYYY-MM-DD')
        }

        subqueries.moduleType = {
            value: 'AIR'
        }

        return params
    }
    const code = fn.toString()
    return parseCode(code)
}

function prepareCodeMasterParams(): Function {
    const fn = function(require, session, params) {
        const subqueries = (params.subqueries = params.subqueries || {})

        subqueries.codeType = {
            value: 'carrier'
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

                        {
                            name: 'name',
                            type: 'string',
                        }

                    ],
                },
                name
            )
        }),

    })

}

// a temp table that Group by carrierCode and JobMonth
function prepareTempTable(name: string): CreateTableJQL {
    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query({

            $select: [
                new ResultColumn(new ColumnExpression(name, 'jobMonth'), 'jobMonth'),
                new ResultColumn(new ColumnExpression(name, 'carrierCode'), 'carrierCode'),
                new ResultColumn(
                    new FunctionExpression('SUM', new ColumnExpression(name, 'chargeableWeight')),
                    'chargeableWeightTotal'
                ),

                new ResultColumn(
                    new FunctionExpression('SUM', new ColumnExpression(name, 'grossWeight')),
                    'grossWeightTotal'
                ),

            ],
            $from: new FromTable(
                {
                    method: 'POST',
                    url: 'api/shipment/query/shipment',
                    columns: [
                        {
                            name: 'carrierCode',
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
                            name: 'grossWeight',
                            type: 'number',
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
                new ColumnExpression(name, 'carrierCode'),
                new ColumnExpression(name, 'jobMonth'),
            ]),

        }),
    })
}

function prepareMonthTable(sourceTable: { name: string, groupBy: string }, summary: { columnName: string, summaryBy: string }[], name: string) {

    const queryObject = {

        $select: [

            new ResultColumn(new ColumnExpression(sourceTable.name, sourceTable.groupBy), sourceTable.groupBy),

        ],
        $from: sourceTable.name,
        $group: new GroupBy(new ColumnExpression(sourceTable.name, sourceTable.groupBy))

    }

    summary.forEach(({ columnName, summaryBy }) => {

        queryObject.$select.push(

            new ResultColumn(
                new FunctionExpression(
                    'IFNULL',
                    new FunctionExpression('SUM', new ColumnExpression(sourceTable.name, `${columnName}Total`)),
                    0),

                `${columnName}Total`)

        )

        for (const [monthkey, monthName] of monthMap.entries()) {

            queryObject.$select.push(
                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression(
                            'FIND',
                            new AndExpressions([
                                new BinaryExpression(
                                    new FunctionExpression(
                                        'MONTHNAME',
                                        new ColumnExpression(sourceTable.name, 'jobMonth'),
                                        'YYYY-MM'
                                    ),
                                    '=',
                                    monthName
                                ),
                                new BinaryExpression(
                                    new ColumnExpression(sourceTable.name, sourceTable.groupBy),
                                    '=',
                                    new ColumnExpression(sourceTable.groupBy)
                                ),
                            ]),
                            new ColumnExpression(`${columnName}Total`)
                        ),
                        0
                    ),
                    `${columnName}${monthkey}Total`
                )
            )

        }
    })

    return new CreateTableJQL({

        $temporary: true,
        name,
        $as: new Query(queryObject)

    })

}

function prepareQuery(sourceTable: { name: string, groupBy: string }, summary: { columnName: string, summaryBy: string }[])
{

    const queryObject = {
        $select : [
            new ResultColumn(new ColumnExpression(sourceTable.name, sourceTable.groupBy), sourceTable.groupBy)
        ],

        $from : new FromTable('code_master', {

            operator : 'LEFT',
            table : sourceTable.name,
            $on : new BinaryExpression(new ColumnExpression('code_master', 'code'), '=', new ColumnExpression(sourceTable.name, sourceTable.groupBy))
        })
    }

    summary.forEach(({ columnName, summaryBy }) => {

        queryObject.$select.push(new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression(sourceTable.name, `${columnName}Total`), 0), `${columnName}Total`), )

        for (const [monthkey, monthName] of monthMap.entries()) {

            queryObject.$select.push(new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression(sourceTable.name, `${columnName}${monthkey}Total`), 0), `${columnName}${monthkey}Total`), )

        }

    })

    return new Query(queryObject)

}

const summary = [
    { columnName: 'grossWeight', summaryBy: 'SUM' },
    { columnName: 'chargeableWeight', summaryBy: 'SUM' }
]

export default [
    [prepareParams(), prepareTempTable('tempTable')],
    [prepareCodeMasterParams(), prepareCodeMasterTable('code_master')],

    prepareMonthTable({ name: 'tempTable', groupBy: 'carrierCode' }, summary, 'month'),

    // new Query({

    //     $select : [
    //         new ResultColumn(new ColumnExpression('code_master', 'code'), 'carrierCode'),
    //     ],

    //     $from : new FromTable('code_master', {

    //         operator : 'LEFT',
    //         table : 'month',
    //         $on : new BinaryExpression(new ColumnExpression('code_master', 'code'), '=', new ColumnExpression('month', 'carrierCode'))
    //     })
    // })

    prepareQuery({ name: 'month', groupBy: 'carrierCode' }, summary)

    // new Query({

    //     $select: [

    //         new ResultColumn(new ColumnExpression('code_master', 'code'), 'carrierCode'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'grossWeightTotal'), 0), 'grossWeightTotal'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'chargeableWeightTotal'), 0), 'chargeableWeightTotal'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Jan'), 0), 'Jan'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Feb'), 0), 'Feb'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Mar'), 0), 'Mar'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Apr'), 0), 'Apr'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'May'), 0), 'May'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Jun'), 0), 'Jun'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Jul'), 0), 'Jul'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Aug'), 0), 'Aug'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Sep'), 0), 'Sep'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Oct'), 0), 'Oct'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Nov'), 0), 'Nov'),
    //         new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('month', 'Dec'), 0), 'Dec'),

    //     ],

    //     $from: new FromTable('code_master', 'code_master',
    //         {
    //             operator: 'LEFT',

    //             table: 'month',

    //             $on: [

    //                 new BinaryExpression(new ColumnExpression('code_master', 'code'), '=', new ColumnExpression('month', 'carrierCode'))

    //             ]

    //         }

    //     )

    // })

]

  // export default query.toJson()
