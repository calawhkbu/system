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
    OrderBy,
    ExistsExpression,
    InExpression,
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

        subqueries.carrierCode = {
            value: 'AA'
        }

        params.fields = ['jobMonth', 'shipment.*']

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

function preparePartyTable() {

    const name = 'party' as string

    const queryParam = {

        $from: new FromTable(
            {
                method: 'POST',
                url: 'api/party/query/party',
                columns: [
                    {
                        name: 'partyId',
                        type: 'number',
                    },

                    {
                        name: 'name',
                        type: 'string',
                    },

                    {
                        name: 'type',
                        type: 'string',
                    },

                    {
                        name: 'erpCode',
                        type: 'string',
                    },

                ],

            }, name)

    }

    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query(queryParam)
    })

}

function prepareRawTable(name: string = 'raw') {

    const queryParam = {

        // hardcode
        $limit: 100,

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
                        name: 'nominatedType',
                        type: 'string',
                    },

                    {
                        name: 'controllingCustomerPartyCode',
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

            },
            name
        ),

    }

    // queryParam.$group()

    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query(queryParam)
    })

}

function prepareFullTable(name: string = 'full') {

    // preform all hardCode middle column, very hardcode
    const queryParam = {

        $select: [

            new ResultColumn(new ColumnExpression('raw', '*')),

            new ResultColumn(new FunctionExpression('If', new ExistsExpression(new Query({

                $from: 'party',
                $where: new AndExpressions([

                    new BinaryExpression(new ColumnExpression('raw', 'controllingCustomerPartyCode'), '=', new ColumnExpression('party', 'erpCode')),
                    new BinaryExpression(new ColumnExpression('party', 'type'), '=', 'forwarder'),

                ])

            }), false),

                new FunctionExpression('IF', new BinaryExpression(new ColumnExpression('raw', 'nominatedType'), '=', 'F'), 'F', 'R'),

                'C'),

                'shipmentType')

        ],

        $from: new FromTable('raw'),
    }

    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query(queryParam)
    })

}

// a temp table that Group by carrierCode and JobMonth
function prepareInitTable(fromTableName: string, group: { majorGroup: string, minorGroup: { columnName: string, option: string[] }[] }, summary: { columnName: string, summaryBy: string }[], name: string): CreateTableJQL {

    const groupByColumnList = group.minorGroup.map(({ columnName }) => columnName).concat(group.majorGroup)

    const groupByList = groupByColumnList.map((columnName: string) => new ColumnExpression(fromTableName, columnName)).concat(new ColumnExpression(fromTableName, 'jobMonth'))

    const selectList = [new ResultColumn(new ColumnExpression(fromTableName, 'jobMonth'), 'jobMonth')]

    groupByColumnList.forEach((columnName: string) => {

        selectList.push(new ResultColumn(new ColumnExpression(fromTableName, columnName), columnName))

    })

    summary.forEach(({ columnName, summaryBy }) => {

        selectList.push(
            new ResultColumn(
                new FunctionExpression('IFNULL', new FunctionExpression(summaryBy, new ColumnExpression(fromTableName, columnName)), 0),
                `${columnName}Total`
            ))

    })

    const queryParam = {

        $select: selectList,
        $from: fromTableName,

        $group: new GroupBy(groupByList)

    }

    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query(queryParam)
    })
}

function prepareMonthTable(fromTableName: string, group: { majorGroup: string, minorGroup: { columnName: string, option: string[] }[] }, summary: { columnName: string, summaryBy: string }[], name: string) {

    const fullGroupByColumnList = group.minorGroup.map(({ columnName }) => columnName).concat(group.majorGroup)

    const queryObject = {

        $select: fullGroupByColumnList.map((column) => new ResultColumn(new ColumnExpression(fromTableName, column), column)),

        $from: fromTableName,
        $group: new GroupBy(fullGroupByColumnList.map((columnName) => new ColumnExpression(fromTableName, columnName)))

    }

    const findCondition = (monthName: string) => {

        const result = [
            new BinaryExpression(
                new FunctionExpression(
                    'MONTHNAME',
                    new ColumnExpression(fromTableName, 'jobMonth'),
                    'YYYY-MM'
                ),
                '=',
                monthName
            )]

        fullGroupByColumnList.forEach((column) => {

            result.push(
                new BinaryExpression(
                    new ColumnExpression(fromTableName, column),
                    '=',
                    new ColumnExpression(column)
                ))
        })

        return result

    }

    summary.forEach(({ columnName, summaryBy }) => {

        queryObject.$select.push(

            new ResultColumn(
                new FunctionExpression(
                    'IFNULL',
                    new FunctionExpression('SUM', new ColumnExpression(fromTableName, `${columnName}Total`)),
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
                            new AndExpressions(findCondition(monthName)),

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

function prepareSummaryTable(
    fromTableName: string,
    group: { majorGroup: string, minorGroup: { columnName: string, option: string[] }[] },
    summary: { columnName: string, summaryBy: string }[], name: string

) {

    function getSelectList(
        reminaingMinorGroup: { columnName: string, option: string[] }[],
        previousCondition?: BinaryExpression[],
        result?: ResultColumn[],
        prefix: string = '',
    ) {
        if (!result) {
            // handle the f
            result = []
        }

        if (!previousCondition) {
            previousCondition = []
        }

        if (!(reminaingMinorGroup && reminaingMinorGroup.length)) {
            return result
        }

        const currentMinorGroup = reminaingMinorGroup.pop()

        const findSummaryCondition = (columnName, optionValue) => {

            const result = JSON.parse(JSON.stringify(previousCondition))

            // ensure that
            reminaingMinorGroup.forEach(({ columnName, option }) => {

                result.push(new InExpression(new ColumnExpression(fromTableName, columnName), false, option))

            })

            result.push(new BinaryExpression(new ColumnExpression(fromTableName, columnName), '=', optionValue))

            return result

        }

        summary.forEach(({ columnName, summaryBy }) => {

            currentMinorGroup.option.forEach((optionValue: string) => {

                const currentPrefix = `${prefix}${currentMinorGroup.columnName}_${optionValue}_`

                const currentConditionList = findSummaryCondition(currentMinorGroup.columnName, optionValue)

                for (const [monthkey, monthName] of monthMap.entries()) {

                    const monthSubTotalColumnName = `${currentPrefix}${columnName}${monthkey}Total`

                    result.push(
                        new ResultColumn(

                            new FunctionExpression('IFNULL',
                                new FunctionExpression('SUM', new FunctionExpression('IF', new AndExpressions(currentConditionList), new ColumnExpression(fromTableName, `${columnName}${monthkey}Total`), 0)),
                                0), monthSubTotalColumnName)

                    )

                }

                const subTotalColumnName = `${currentPrefix}${columnName}Total`

                result.push(
                    new ResultColumn(

                        new FunctionExpression('IFNULL', new FunctionExpression('SUM',
                            new FunctionExpression('IF', new AndExpressions(currentConditionList), new ColumnExpression(fromTableName, `${columnName}Total`), 0)), 0)
                        , subTotalColumnName)
                )

                result = getSelectList(reminaingMinorGroup, currentConditionList, result, currentPrefix)

            })

        })

        return result

    }

    const queryObject = {

        $select: getSelectList(group.minorGroup),

        // $select : [

        //     new ResultColumn(new ColumnExpression(fromTableName, group.majorGroup), group.majorGroup),
        //     new ResultColumn(new FunctionExpression('SUM', new ColumnExpression(fromTableName, 'chargeableWeightTotal')), 'total')

        // ],

        // only group by carrierCode
        $group: new GroupBy(new ColumnExpression(fromTableName, group.majorGroup)),
        $from: fromTableName,

    }

    return new CreateTableJQL({

        $temporary: true,
        name,
        $as: new Query(queryObject)

    })

}

const group = {

    majorGroup: 'carrierCode',

    // in minorGroup, order is important
    minorGroup: [
        {
            columnName: 'shipmentType',
            option: ['F', 'R', 'C']
        }

    ]

}

const summary = [
    // { columnName: 'grossWeight', summaryBy: 'SUM' },
    { columnName: 'chargeableWeight', summaryBy: 'SUM' }
]

export default [

    // prepare the full table conatining all requiredData first
    [prepareParams(), prepareRawTable()],
    preparePartyTable(),
    prepareFullTable(),

    // convert it into summay table
    prepareInitTable('full', group, summary, 'init'),
    prepareMonthTable('init', group, summary, 'month'),
    prepareSummaryTable('month', group, summary, 'summary'),

    new Query({

        $from: 'month',

    })

]
