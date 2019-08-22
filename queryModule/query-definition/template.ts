import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, BinaryExpression, ColumnExpression, RegexpExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query('template'))

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('template', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'fileType',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('template', 'fileType'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'templateName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('template', 'templateName'), false),
    })
  )
  .register('value', 0)

query.register(
  'isActive',
  new Query({
    $where: [new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false), new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false)],
  })
)

export default query
