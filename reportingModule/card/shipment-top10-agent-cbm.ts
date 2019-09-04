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
                        new FunctionExpression('SUM', new ColumnExpression('shipment', 'cbm')),
                        0
                    ),
                    'totalCbm'
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
                            name: 'cbm',
                            type: 'number',
                        },
                    ],

                },
                'shipment'
            ),

            $group: new GroupBy([new ColumnExpression('shipment', 'agentPartyCode')]),

        })

    })

}

function preparePartyParams(): Function {

    return function(require, session, params)
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

        // script
        const subqueries = (params.subqueries = params.subqueries || {})

        subqueries.thirdPartyCodeKey = {
            key : '$.erp',
            value : 'abc'

        }

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

            name : 'partyTemp',
            $as : new Query({

                $select: [

                    new ResultColumn(new ColumnExpression('party', 'name')),

                ],
                $from: new FromTable(
                    {
                        method: 'POST',
                        url: 'api/party/query/party',
                        columns: [

                            {
                                name: 'name',
                                type: 'string',
                            },

                        ],

                    },
                    'party'
                ),

            })

        })

    }

}

export default [

    // [prepareTop10Params(), prepareTop10table()],
    [preparePartyParams(), preparePartyTable()],

    new Query({

        $from : 'partyTemp',

        // $order: [new OrderBy(new ColumnExpression('top10', 'totalChargeableWeight'), 'DESC')],

        // $limit : 10
    })

]
