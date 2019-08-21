import { ColumnExpression, CreateTableJQL, FromTable, FunctionExpression, GroupBy, Query, ResultColumn,OrderBy,JoinClause,BinaryExpression } from 'node-jql'

function prepareParams (): Function {
  return function (require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = params.subqueries = params.subqueries || {}
    return params
  }
}

function prepareTable (name: string): CreateTableJQL {
    return new CreateTableJQL({
      $temporary: true,
      name,
      $as: new Query({
        $select: [

            new ResultColumn(new ColumnExpression(name,'shipperPartyId')),
            new ResultColumn(new FunctionExpression('IFNULL',new FunctionExpression('SUM', new ColumnExpression(name,'volume')),0),'volume'),
        ],
        $from: new FromTable({
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            {
              name: 'volume',
              type: 'number'
            },
            {
                name: 'shipperPartyId',
                type: 'number'
            },
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

            new ColumnExpression(name, 'shipperPartyId')

        ]),
        $order : [
          new OrderBy('volume', 'DESC')
        ]
        $limit : 10

      })
    })
  }



  function preparePartyTable (name: string): CreateTableJQL {
    return new CreateTableJQL({
      $temporary: true,
      name,

      $as : new Query({

          $from : new FromTable({
                method: 'POST',
                url: 'api/party/query/party',
                columns: [
                  {
                    name: 'id',
                    type: 'number'
                  },
                  {
                    name: 'name',
                    type: 'string'
                  },
                  {
                    name: 'type',
                    type: 'string'
                  },
                ],

              data: {
                // include jobMonth from the table
                fields: ['party_type.*','party.*']
                }
              },  name)

              $where : new BinaryExpression(new ColumnExpression('type'), '=','shipper')
              
          })

    })
  }




export default [
  [prepareParams(), prepareTable('tempTable')],
  [prepareParams(),preparePartyTable('party')],

  new Query({

    $select : [

      new ResultColumn(new ColumnExpression('party','id')),
      new ResultColumn(new ColumnExpression('party','name')),
      new ResultColumn(new ColumnExpression('tempTable','volume')),


    ],

    $from : new FromTable('party','party')


    $from : new FromTable('tempTable','tempTable',
    new JoinClause('INNER', new FromTable('party','party'),
    new BinaryExpression(new ColumnExpression('tempTable', 'shipperPartyId'), '=', new ColumnExpression('party', 'id'))
    )),

    $order : [
      new OrderBy(new ColumnExpression('tempTable','volume'), 'DESC')
    ]
    $limit : 10


  })

]
