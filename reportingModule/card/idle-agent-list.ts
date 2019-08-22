import { Query, FromTable, CreateTableJQL, ResultColumn, ColumnExpression, FunctionExpression, GroupBy, BinaryExpression, AndExpressions } from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams (): Function {
    const fn = function (require, session, params) {

        const moment = require('moment')
        const subqueries = params.subqueries = params.subqueries || {}

        if (subqueries.date) {
            // get the year part of the "from date"
            const month = moment(subqueries.date.from, 'YYYY-MM-DD').month()

            // reset the date.from and date.to depending on date.from YEAR
            subqueries.date.from = moment().month(month).startOf('month').format('YYYY-MM-DD')
            subqueries.date.to = moment().month(month).endOf('month').format('YYYY-MM-DD')

        }

        return params
    }
    const code = fn.toString()
    return parseCode(code)
}

// a temp table that Group by carrierCode and JobMonth
function prepareTempTable2 (name: string): CreateTableJQL {

    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query({
            $select: [
                new ResultColumn(new ColumnExpression(name, 'agentPartyId'), 'agentPartyId'),
            ],

            $from: new FromTable({
                method: 'POST',
                url: 'api/booking/query/booking',
                columns: [
                    {
                        name: 'agentPartyId',
                        type: 'number'
                    }
                ]

            }, name),

            $where : new BinaryExpression(new FunctionExpression('ISNULL', new ColumnExpression(name, 'agentPartyId')), '=' , '0'),

        })
    })
}

// a temp table that Group by carrierCode and JobMonth
function prepareTempTable (name: string): CreateTableJQL {
    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query({
            $select: [
                new ResultColumn(new ColumnExpression(name, 'partyId'), 'partyId'),

                new ResultColumn(new ColumnExpression(name, 'name'), 'name'),
                new ResultColumn(new ColumnExpression(name, 'type'), 'type')
            ],
            $from: new FromTable({
                method: 'POST',
                url: 'api/party/query/party',
                columns: [

                    {
                        name : 'partyId',
                        type : 'number'
                    },
                    {
                        name: 'name',
                        type: 'string'
                    },
                    {

                        name : 'type'
                        tpye : 'string'

                    }

                ],

                data: {
                    // include jobMonth from the table
                    fields: ['partyId', 'name', 'type']
                }

            }, name),

            $where: new BinaryExpression(new ColumnExpression('type'), '=', 'shipper')
            // // $where: new BinaryExpression(new ColumnExpression('type'), '=', 'agent')

        })
    })
}

export default [

    [prepareParams(), prepareTempTable2('tempTable2')]
    new Query({

        $select: [

            new ResultColumn(new ColumnExpression('party', 'partyId')),
            new ResultColumn(new ColumnExpression('party', 'name')),
            new ResultColumn(new ColumnExpression('party', 'type')),
        ],

        $from: new FromTable({
            method: 'POST',
            url: 'api/party/query/party',
            columns: [

                {
                    name : 'partyId',
                    type : 'number'
                },
                {
                    name: 'name',
                    type: 'string'
                },
                {
                    name : 'type'
                    tpye : 'string'
                }
            ],
        }, 'party'),

]

// export default query.toJson()
