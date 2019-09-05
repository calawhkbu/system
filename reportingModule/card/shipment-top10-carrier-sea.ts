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
    IsNullExpression,
    AndExpressions,
} from 'node-jql'

import { parseCode } from 'utils/function'

function prepareTop10Params(): Function {
    return function(require, session, params) {
        // import
        const { BadRequestException } = require('@nestjs/common')

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
            value : 'SEA'
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
                new ResultColumn(new ColumnExpression('shipment', 'carrierCode')),

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
                            name: 'carrierCode',
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

            $where : new IsNullExpression(new ColumnExpression('shipment', 'carrierCode'), true),

            $group: new GroupBy([new ColumnExpression('shipment', 'carrierCode')]),

            $order: [new OrderBy(new ColumnExpression('totalCbm'), 'DESC')],

            $limit : 10

        })

    })

}

export default [
    [prepareTop10Params(), prepareTop10table()],

    new Query({

        $from : 'top10',

        // $order: [new OrderBy(new ColumnExpression('top10', 'totalCbm'), 'DESC')],

        // $limit : 10
    })

]
