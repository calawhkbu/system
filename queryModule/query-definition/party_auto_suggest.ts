import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  OrExpressions,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  InExpression,
  IsNullExpression,
  AndExpressions,
  FunctionExpression,
  Unknown,
  Value
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $distinct: true,
    $select: [
      new ResultColumn(new ColumnExpression('party', 'id'), 'id'),
      new ResultColumn(new ColumnExpression('party', 'name'), 'name'),
      new ResultColumn(new ColumnExpression('party', 'id'), 'partyId'),
      new ResultColumn(new ColumnExpression('party', 'name'), 'partyName'),

      new ResultColumn(new FunctionExpression(
        'JSON_UNQUOTE',
        new FunctionExpression('JSON_EXTRACT', new ColumnExpression('party', 'thirdPartyCode'), '$.erp')
      ), 'erpCode'),

      new ResultColumn(new FunctionExpression(
        'JSON_UNQUOTE',
        new FunctionExpression('JSON_EXTRACT', new ColumnExpression('party', 'thirdPartyCode'), '$.old360')
      ), 'old360Id'),

      new ResultColumn(new ColumnExpression('party', 'phone'), 'partyPhone'),
      new ResultColumn(new ColumnExpression('party', 'fax'), 'partyFax'),
      new ResultColumn(new ColumnExpression('party', 'email'), 'partyEmail'),
      new ResultColumn(new ColumnExpression('party', 'address'), 'partyAddress'),
      new ResultColumn(new ColumnExpression('party', 'cityCode'), 'partyCityCode'),
      new ResultColumn(new ColumnExpression('party', 'stateCode'), 'partyStateCode'),
      new ResultColumn(new ColumnExpression('party', 'countryCode'), 'partyCountryCode'),
      new ResultColumn(new ColumnExpression('party', 'zip'), 'partyZip'),
      new ResultColumn(new ColumnExpression('person', 'id'), 'contactPersonId'),
      new ResultColumn(new ColumnExpression('person', 'displayName'), 'contactPersonName'),
      // TODO new ResultColumn({ expression: 'TODO', $as: 'contactPersonPhone' }),
      new ResultColumn(new ColumnExpression('person', 'userName'), 'contactPersonEmail'),
    ],
    $from: new FromTable(
      'party',
      {
        operator: 'LEFT',
        table: 'party_type',
        $on: new BinaryExpression(
          new ColumnExpression('party', 'id'),
          '=',
          new ColumnExpression('party_type', 'partyId')
        ),
      },
      {
        operator: 'LEFT',
        table: 'party_group',
        $on: new BinaryExpression(
          new ColumnExpression('party_group', 'code'),
          '=',
          new ColumnExpression('party', 'partyGroupCode')
        ),
      },
      {
        operator: 'LEFT',
        table: 'parties_person',
        $on: new BinaryExpression(
          new ColumnExpression('party', 'id'),
          '=',
          new ColumnExpression('parties_person', 'partyId')
        ),
      },
      {
        operator: 'LEFT',
        table: 'person',
        $on: new BinaryExpression(
          new ColumnExpression('person', 'id'),
          '=',
          new ColumnExpression('parties_person', 'personId')
        ),
      }
    ),
  })
)

query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('party', 'id'), '='),
    })
  )
  .register('value', 0)

query.register('old360Id', new Query({
  $where: new BinaryExpression(

    new FunctionExpression(
      'JSON_UNQUOTE',
      new FunctionExpression('JSON_EXTRACT', new ColumnExpression('party', 'thirdPartyCode'), '$.old360')
    ), '='),

})
).register('value', 0)

query.register('erpCode', new Query({
  $where: new BinaryExpression(

    new FunctionExpression(
      'JSON_UNQUOTE',
      new FunctionExpression('JSON_EXTRACT', new ColumnExpression('party', 'thirdPartyCode'), new Value('$.erp'))
    ), '=', new Unknown()),

  })
).register('value', 0)

//

// query
//   .register(
//     'thirdPartyCodeKey',
//     new Query({
//       $where: new BinaryExpression(
//         new FunctionExpression(
//           'JSON_UNQUOTE',
//           new FunctionExpression(
//             'JSON_EXTRACT',
//             new ColumnExpression('party', 'thirdPartyCode'),
//             new Unknown('string')
//           )
//         ),
//         '='
//       ),
//     })
//   )
//   .register('key', 0)
//   .register('value', 1)

query
  .register(
    'isBranch',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('party', 'isBranch'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'partyTypes',
    new Query({
      $where: new InExpression(new ColumnExpression('party_type', 'type'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('party', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

query.register(
  'isActive',
  new Query({
    $where: new AndExpressions({
      expressions: [
        new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false),
      ],
    }),
  })
)

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('party', 'name'), false),
        new RegexpExpression(new ColumnExpression('party', 'shortName'), false),
        // new RegexpExpression(new ColumnExpression('party', 'erpCode'), false)
      ]),
    })
  )
  .register('value', 0)
  .register('value', 1) // .register('value', 2)

export default query
