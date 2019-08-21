import { Query, FromTable, CreateTableJQL,GroupBy, ResultColumn, ColumnExpression, FunctionExpression,AndExpressions,BinaryExpression } from 'node-jql'
import { parseCode } from 'utils/function'


function prepareParams(currentMonth?: boolean): Function {
    const fn = function (require, session, params) {

        const moment = require('moment')
        const subqueries = params.subqueries = params.subqueries || {}

        if (subqueries.date) { 
            // get the year part of the "from date"
            let month = moment(subqueries.date.from, 'YYYY-MM-DD').month()

            // change the from / to date
            if (!currentMonth)
            {
                month -= 1
            }
            // reset the date.from and date.to depending on date.from YEAR
            subqueries.date.from = moment().month(month).startOf('month').format('YYYY-MM-DD')
            subqueries.date.to = moment().month(month).endOf('month').format('YYYY-MM-DD')

            console.log('subqueries.date.from',subqueries.date.from)
            console.log('subqueries.date.to',subqueries.date.to)
        }

        return params
    }
    let code = fn.toString()
    code = code.replace(new RegExp('currentMonth', 'g'), String(currentMonth))
    return parseCode(code)
}

function prepareTable (name: string): CreateTableJQL {
    return new CreateTableJQL({
      $temporary: true,
      name,
      $as: new Query({
        $select: [

        new ResultColumn(new ColumnExpression(name,'moduleTypeCode')),
        new ResultColumn(new ColumnExpression(name,'jobMonth')),
        new ResultColumn(new FunctionExpression('IFNULL',new FunctionExpression('SUM', new ColumnExpression(name,'quantity')),0),'quantity'),
        ],
        $from: new FromTable({
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            {
                name: 'moduleTypeCode',
                type: 'string'
            },
            {
              name: 'quantity',
              type: 'number'
            },
            {
                name: 'jobMonth',
                type: 'string'
            }
          ],

          data: {

            subqueries: {
                jobMonth: true
            },
            // include jobMonth from the table
            fields: ['jobMonth', 'booking.*','booking_popacking.*']
            }


        }, name),
        $group: new GroupBy([

            new ColumnExpression(name, 'moduleTypeCode'),
            new ColumnExpression(name, 'jobMonth')
            // new ColumnExpression(name, 'year')

          ])
      })
    })
  }

export default [
    [prepareParams(),prepareTable('tempTable')],

    // new Query({
    //     $from : 'tempTable'

    // })

    

    new Query({

        $select : [

            
            // hard code 12 months

            // new ResultColumn(new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),'monthName'),


            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'January'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Jan'),

            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'February'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Feb'),


            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'March'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Mar'),


            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'April'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Apr'),


            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'May'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'May'),


            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'June'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Jun'),

            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'July'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Jul'),


            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',
                        new AndExpressions([
                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'August'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Aug'),


            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'September'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Sep'),


            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'October'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Oct'),


            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'November'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Nov'),



            new ResultColumn(
                new FunctionExpression('IFNULL',
                    new FunctionExpression('FIND',

                        new AndExpressions([

                            new BinaryExpression(new FunctionExpression('MONTHNAME', new ColumnExpression('tempTable', 'jobMonth'), 'YYYY-MM'), '=', 'December'),
                            new BinaryExpression(new ColumnExpression('tempTable', 'moduleTypeCode'), '=', new ColumnExpression('moduleTypeCode'))
                        ]),
                        new ColumnExpression('quantity')
                    ), 0),
                'Dec'),
            // new ResultColumn('*'),

            new ResultColumn(new ColumnExpression('tempTable', 'moduleTypeCode'), 'moduleTypeCode'),

        ]

        $from: 'tempTable',

        $group: 'moduleTypeCode',
      })

]
