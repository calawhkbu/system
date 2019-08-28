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

        // get the idList

        if (!subqueries.idListString) throw new BadRequestException('MISSING_idListString')

        const idList = subqueries.idListString.value.split(',')

        subqueries.idList = {
            value: idList,
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

                new ResultColumn(new ColumnExpression(name, 'id')),
                new ResultColumn(new ColumnExpression(name, 'moduleTypeCode')),
                new ResultColumn(new ColumnExpression(name, 'bookingNo'))

            ],

            $from: new FromTable(
                {
                    method: 'POST',
                    url: 'api/booking/query/booking',
                    columns: [

                        { name: 'bookingId', type: 'number', $as: 'id' },
                        { name: 'moduleTypeCode', type: 'string' },
                        { name: 'bookingNo', type: 'string' },

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
