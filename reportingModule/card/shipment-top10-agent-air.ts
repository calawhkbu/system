import {
    ColumnExpression,
    CreateTableJQL,
    FromTable,
    FunctionExpression,
    GroupBy,
    Query,
    ResultColumn,
    OrderBy,
    JoinClause,
    BinaryExpression,
} from 'node-jql'

import { parseCode } from 'utils/function'

function prepareTop10Params(): Function {
    return function(require, session, params) {

        const { Resultset } = require('node-jql-core')
        const {
            ColumnExpression,
            CreateTableJQL,
            InsertJQL,
            FromTable,
            InExpression,
            BetweenExpression,
            FunctionExpression,
            BinaryExpression,
            GroupBy,
            Query,
            ResultColumn,
        } = require('node-jql')
        const moment = require('moment')
        // script
        const subqueries = (params.subqueries = params.subqueries || {})

        // set daterange be this year if date is not given

        console.log('before')
        console.log(params)

        if (!subqueries.date)
        {
            const year = moment().year()
            subqueries.date = {}
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

            value : 'AIR'
        }

        return params
    }
}

function prepareTop10table(): CreateTableJQL
{

    return new CreateTableJQL({

        $temporary : true,

        name : 'top10',
        $as : new Query({

            $select: [
                new ResultColumn(new ColumnExpression('shipment', 'agentPartyCode')),

                new ResultColumn(
                    new FunctionExpression(
                        'IFNULL',
                        new FunctionExpression('SUM', new ColumnExpression('shipment', 'chargeableWeight')),
                        0
                    ),
                    'totalChargeableWeight'
                ),
            ],
            $from: new FromTable(
                {
                    method: 'POST',
                    url: 'api/shipment/query/shipment',
                    columns: [

                        {
                            name: 'agentPartyCode',
                            type: 'string',
                        },
                        {
                            name: 'chargeableWeight',
                            type: 'number',
                        },
                    ],

                },
                'shipment'
            ),

            $group: new GroupBy([new ColumnExpression('shipment', 'agentPartyCode')]),

            $order: [new OrderBy(new ColumnExpression('totalChargeableWeight'), 'DESC')],

            $limit : 10

        })

    })

}

function preparePartyParams(): Function {

    return async function(require, session, params)
    {

        const { Resultset } = require('node-jql-core')
        const {
            ColumnExpression,
            CreateTableJQL,
            InsertJQL,
            FromTable,
            InExpression,
            BetweenExpression,
            FunctionExpression,
            BinaryExpression,
            GroupBy,
            Query,
            ResultColumn,
        } = require('node-jql')
        const moment = require('moment')

        const top10Result = new Resultset(await session.query(new Query('top10'))).toArray()

        // script
        const subqueries = (params.subqueries = params.subqueries || {})

        return params

    }

}

// table for getting party
function preparePartyTable(): Function
{

    return function(require, session, params) {

        const { Resultset } = require('node-jql-core')
        const {
            ColumnExpression,
            CreateTableJQL,
            InsertJQL,
            FromTable,
            InExpression,
            BetweenExpression,
            FunctionExpression,
            BinaryExpression,
            GroupBy,
            Query,
            ResultColumn,
        } = require('node-jql')
        const moment = require('moment')

        return new CreateTableJQL({

            $temporary : true,

            name : 'party',
            $as : new Query({

                $select: [

                    new ResultColumn(new ColumnExpression('party', 'id')),
                    new ResultColumn(new ColumnExpression('party', 'name')),
                    new ResultColumn(new ColumnExpression('party', 'erpCode')),

                ],
                $from: new FromTable(
                    {
                        method: 'POST',
                        url: 'api/party/query/party',
                        columns: [

                            {
                                name: 'id',
                                type: 'number',
                            },

                            {
                                name: 'name',
                                type: 'string',
                            },

                            {
                                name: 'thirdPartyCode',
                                type: 'string',
                            },

                            {
                                name: 'erpCode',
                                type: 'string',
                            },

                        ],

                        data: {
                            subqueries: {
                                erpCode: true,
                            },
                            // include jobMonth from the table
                            fields: ['erpCode', 'party.*'],
                        },

                    },
                    'party'
                ),

            })

        })

    }

}

export default [

    [prepareTop10Params(), prepareTop10table()],
    [preparePartyParams(), preparePartyTable()],

    new Query({

        $select : [

            new ResultColumn(new ColumnExpression('top10', 'totalChargeableWeight')),
            new ResultColumn(new FunctionExpression('IFNULL', new ColumnExpression('party', 'name'), new ColumnExpression('top10', 'agentPartyCode')), 'partyName')
        ],

        $from : new FromTable('top10', {

            operator : 'LEFT',
            table : 'party',
            $on : [

                new BinaryExpression(new ColumnExpression('top10', 'agentPartyCode'), '=', new ColumnExpression('party', 'erpCode'))

            ]

        })

    })

]
