import {
    ColumnExpression,
    CreateTableJQL,
    FromTable,
    BetweenExpression,
    FunctionExpression,
    BinaryExpression,
    GroupBy,
    Query,
    ResultColumn,
} from 'node-jql'
import { parseCode } from 'utils/function'
import { Resultset } from 'node-jql-core'

function prepareParams(): Function {
    return function(require, session, params) {
        // import
        const { BadRequestException } = require('@nestjs/common')
        const moment = require('moment')

        // script
        const subqueries = (params.subqueries = params.subqueries || {})

        if (!(subqueries.date && subqueries.date.from)) {

            // hardcode
            subqueries.date = {
                from: moment().subtract(10, 'days'),
                to: moment(),
            }

        }

        return params
    }

}

function prepareShipmentTable(name: string): CreateTableJQL {

    return new CreateTableJQL({
        $temporary: true,
        name,
        $as: new Query({
            $from: new FromTable(
                {
                    method: 'POST',
                    url: 'api/shipment/query/shipment',
                    columns: [
                        { name: 'houseNo', type: 'string' },
                        { name: 'jobDate', type: 'Date' },
                        { name: 'jobNo', type: 'string' },
                        { name: 'masterNo', type: 'string' },
                        { name: 'bookingNo', type: 'string' },
                        { name: 'poNo', type: 'string' },
                        { name: 'contractNo', type: 'string' },

                        { name: 'moduleType', type: 'string' },
                        { name: 'boundType', type: 'string' },
                        { name: 'serviceType', type: 'string' },
                        { name: 'contractNo', type: 'string' },
                    ]
                },
                name
            ),
        }),
    })

}

export default [
    [prepareParams(), prepareShipmentTable('shipment')],

    new Query({

        $select: [

            new ResultColumn(new ColumnExpression('shipment', 'houseNo')),
            new ResultColumn(new ColumnExpression('shipment', 'jobDate')),
            new ResultColumn(new ColumnExpression('shipment', 'masterNo')),
        ],

        $from: new FromTable('shipment')
    })

]
