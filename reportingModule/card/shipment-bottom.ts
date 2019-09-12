import {
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
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareBookingParams(): Function {
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
        const { BadRequestException } = require('@nestjs/common')
        const moment = require('moment')

        // script
        const subqueries = (params.subqueries = params.subqueries || {})

        // get the primaryKeyList

        if (!subqueries.primaryKeyListString) throw new BadRequestException('MISSING_primaryKeyListString')

        const primaryKeyList = subqueries.primaryKeyListString.value.split(',')

        subqueries.primaryKeyList = {
            value: primaryKeyList,
        }

        return params
    }

    const code = fn.toString()
    return parseCode(code)
}

function prepareBookingable(name: string): CreateTableJQL {
    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query({
            $select: [

                new ResultColumn(new ColumnExpression(name, 'houseNo')),
                new ResultColumn(new ColumnExpression(name, 'jobNo')),
                new ResultColumn(new ColumnExpression(name, 'moduleType')),
                new ResultColumn(new ColumnExpression(name, 'jobDate'))

            ],

            $from: new FromTable(
                {
                    method: 'POST',
                    url: 'api/shipment/query/shipment',
                    columns: [

                        { name: 'houseNo', type: 'string' },
                        { name: 'jobNo', type: 'string' },
                        { name: 'moduleType', type: 'string' },
                        { name: 'jobDate', type: 'Date' },

                    ],
                },
                name
            ),
        }),
    })
}

export default [
    [prepareBookingParams(), prepareBookingable('booking')],

    new Query({
        $from: 'booking',
    }),
]
