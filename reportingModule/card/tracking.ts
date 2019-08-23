import {
  Query,
  FromTable,
  CreateTableJQL,
  ResultColumn,
  ColumnExpression,
  FunctionExpression,
  GroupBy,
  JoinClause,
  BinaryExpression,
  ParameterExpression,
} from 'node-jql'

function prepareParams(check?: boolean): Function {
  if (check) {
    return function(require, session, params) {
      // import
      const { BadRequestException } = require('@nestjs/common')
      const moment = require('moment')

      // script
      const subqueries = params.subqueries || {}
      if (!subqueries.date) throw new BadRequestException('MISSING_DATE')
      const datefr = moment(subqueries.date.from, 'YYYY-MM-DD')
      const dateto = moment(subqueries.date.to, 'YYYY-MM-DD')
      if (dateto.diff(datefr, 'months', true) > 1)
        throw new BadRequestException('DATE_RANGE_TOO_LARGE')
      if (!subqueries.moduleType) throw new BadRequestException('MISSING_MODULE_TYPE')
      return params
    }
  }
  return function(require, session, params) {
    return params
  }
}

export default [
  // prepare tables
  [
    prepareParams(true),
    function(require, session, params) {
      // import
      const { CreateTableJQL, FromTable, Query } = require('node-jql')

      // script
      const subqueries = params.subqueries || {}
      return new CreateTableJQL({
        $temporary: true,
        name: 'status_master',
        $as: new Query({
          $from: new FromTable(
            {
              url: `api/statusMaster/query/tracking-flow-${subqueries.moduleType.value}`,
              columns: [{ name: 'group', type: 'string' }, { name: 'status', type: 'string' }],
            },
            'status_master'
          ),
        }),
      })
    },
  ],
  [
    prepareParams(),
    new CreateTableJQL({
      $temporary: true,
      name: 'tracking',
      $as: new Query({
        $select: [
          new ResultColumn(new ColumnExpression('lastStatus')),
          new ResultColumn(
            new FunctionExpression(
              'COUNT',
              new ParameterExpression({
                prefix: 'DISTINCT',
                expression: new ColumnExpression('trackingNo'),
              })
            ),
            'count'
          ),
        ],
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/tracking',
            columns: [
              {
                name: 'tracking.trackingNo',
                type: 'string',
                $as: 'trackingNo',
              },
              { name: 'tracking.lastStatus', type: 'string', $as: 'lastStatus' },
            ],
          },
          'tracking'
        ),
        $group: 'lastStatus',
      }),
    }),
  ],
  new CreateTableJQL({
    $temporary: true,
    name: 'intermediate',
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression('sm', 'group'), 'group'),
        new ResultColumn(
          new FunctionExpression('SUM', new ColumnExpression('t', 'count')),
          'count'
        ),
      ],
      $from: new FromTable(
        'tracking',
        't',
        new JoinClause(
          'LEFT',
          new FromTable('status_master', 'sm'),
          new BinaryExpression(
            new ColumnExpression('t', 'lastStatus'),
            '=',
            new ColumnExpression('sm', 'status')
          )
        )
      ),
      $group: new GroupBy(new ColumnExpression('sm', 'group')),
    }),
  }),

  // finalize
  new Query({
    $select: [
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('group'), '=', 'Not in Track'),
            new ColumnExpression('count')
          ),
          0
        ),
        'notInTrack'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('group'), '=', 'Processing'),
            new ColumnExpression('count')
          ),
          0
        ),
        'processing'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('group'), '=', 'Cargo Ready'),
            new ColumnExpression('count')
          ),
          0
        ),
        'cargoReady'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('group'), '=', 'Departure'),
            new ColumnExpression('count')
          ),
          0
        ),
        'departure'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('group'), '=', 'Arrival'),
            new ColumnExpression('count')
          ),
          0
        ),
        'arrival'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('group'), '=', 'Delivered'),
            new ColumnExpression('count')
          ),
          0
        ),
        'delivered'
      ),
    ],
    $from: 'intermediate',
  }),
]
