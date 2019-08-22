import { BinaryExpression, ColumnExpression, FromTable, IsNullExpression, JoinClause, Query, ResultColumn } from 'node-jql'
import { Session } from 'node-jql-core'

export default [
  [
    function(require, session, params) {
      // import
      const { BadRequestException } = require('@nestjs/common')

      // script
      const subqueries = params.subqueries || {}
      if (!subqueries.type) throw new BadRequestException('MISSING_TYPE')
      if (subqueries.type.value !== 'pod' && subqueries.type.value !== 'pol') throw new BadRequestException(`INVALID_TYPE_${String(subqueries.type.value).toLocaleUpperCase()}`)
      return params
    },
    function(require, session, params) {
      // import
      const { ColumnExpression, CreateTableJQL, FromTable, FunctionExpression, Query, ResultColumn } = require('node-jql')

      // script
      const subqueries = params.subqueries || {}
      const portColumn = subqueries.type.value
      return new CreateTableJQL({
        $temporary: true,
        name: 'shipment',
        $as: new Query({
          $select: [new ResultColumn('port'), new ResultColumn(new FunctionExpression('COUNT', new ColumnExpression('id')), 'count')],
          $from: new FromTable(
            {
              url: 'api/shipment/query/shipment',
              columns: [{ name: 'id', type: 'number' }, { name: portColumn, type: 'string', $as: 'port' }],
            },
            'shipment'
          ),
          $group: 'port',
        }),
      })
    },
  ],
  [
    async function(require, session: Session, params) {
      // import
      const { Query } = require('node-jql')
      const { Resultset } = require('node-jql-core')

      // script
      const result = await session.query(new Query({ $distinct: true, $select: 'port', $from: 'shipment' }))
      const ports = new Resultset(result).toArray().map(({ port }) => port)
      const subqueries = (params.subqueries = params.subqueries || {})
      subqueries.ports = { value: ports }
      return params
    },
    new Query({
      $select: [
        new ResultColumn(new ColumnExpression('shipment', 'count')),
        new ResultColumn(new ColumnExpression('shipment', 'port')),
        new ResultColumn(new ColumnExpression('location', 'latitude')),
        new ResultColumn(new ColumnExpression('location', 'longitude')),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/location/query/location',
          columns: [{ name: 'portCode', type: 'string' }, { name: 'latitude', type: 'number' }, { name: 'longitude', type: 'number' }],
        },
        'location',
        new JoinClause('LEFT', 'shipment', new BinaryExpression(new ColumnExpression('location', 'portCode'), '=', new ColumnExpression('shipment', 'port')))
      ),
      $where: [new IsNullExpression(new ColumnExpression('location', 'latitude'), true), new IsNullExpression(new ColumnExpression('location', 'longitude'), true)],
    }),
  ],
]
