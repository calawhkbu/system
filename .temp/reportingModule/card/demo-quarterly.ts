import {
  BinaryExpression,
  ColumnExpression,
  FunctionExpression,
  GroupBy,
  Query,
  ResultColumn,
  FromTable,
  CreateTableJQL,
} from 'node-jql'

function tempQuery()
{
  return function(require, session, params)
  {
    const { moment } = params.packages
    return new CreateTableJQL({
      $temporary: true,
      name: 'temp',
      $as: new Query({
        $select: [
          new ResultColumn('*'),
          new ResultColumn(
            new FunctionExpression('QUARTER', new ColumnExpression('month'), 'YYYY-MM'),
            'quarter'
          ),
        ],
        $from: new FromTable(
          {
            url: 'demo',
            columns: [
              {
                name: 'group',
                type: 'string',
              },
              {
                name: 'month',
                type: 'string',
              },
              {
                name: 'value',
                type: 'number',
              },
              {
                name: 'flag',
                type: 'boolean',
              },
            ],
          },
          'Test'
        ),
        $where: new BinaryExpression(new ColumnExpression('group'), '=', String(moment().year())),
      }),
    })

  }

}

// const tempQuery = new CreateTableJQL({
//   $temporary: true,
//   name: 'temp',
//   $as: new Query({
//     $select: [
//       new ResultColumn('*'),
//       new ResultColumn(
//         new FunctionExpression('QUARTER', new ColumnExpression('month'), 'YYYY-MM'),
//         'quarter'
//       ),
//     ],
//     $from: new FromTable(
//       {
//         url: 'demo',
//         columns: [
//           {
//             name: 'group',
//             type: 'string',
//           },
//           {
//             name: 'month',
//             type: 'string',
//           },
//           {
//             name: 'value',
//             type: 'number',
//           },
//           {
//             name: 'flag',
//             type: 'boolean',
//           },
//         ],
//       },
//       'Test'
//     ),
//     $where: new BinaryExpression(new ColumnExpression('group'), '=', String(moment().year())),
//   }),
// })

const query = new Query({
  $select: [
    new ResultColumn('quarter'),
    new ResultColumn(new FunctionExpression('SUM', new ColumnExpression('value')), 'value'),
    new ResultColumn('flag'),
  ],
  $from: 'temp',
  $group: 'quarter',
})

export default [tempQuery(), query.toJson()]
