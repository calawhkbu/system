import {
  IConditionalExpression,
  OrExpressions,
  AndExpressions,
  BinaryExpression,
  ColumnExpression,
  FunctionExpression,
  InExpression,
  Query,
  ResultColumn,
  FromTable,
  MathExpression,
  IsNullExpression,
  ExistsExpression,
} from 'node-jql'
import {
  JwtPayload,
  JwtPayloadParty
} from 'modules/auth/interfaces/jwt-payload'
import {
  Transaction,
  Op
} from 'sequelize'
import moment = require('moment')
import {
  IQueryParams
} from 'classes/query'

export default async function getDefaultParams(
  params: IQueryParams,
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    if (user.selectedPartyGroup) {
      const partyGroupExpression = new OrExpressions([
        // if partyGroupCode is not null
        // if code is null, means disable that code
        new AndExpressions([
          new BinaryExpression(new ColumnExpression('code_master', 'partyGroupCode'), '=', user.selectedPartyGroup.code),
          new IsNullExpression(new ColumnExpression('code_master', 'name'), true)
        ]),
        // if partyGroupCode is null (default code)
        // check if partyGroupCode override
        new AndExpressions([
          new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), false),
          new ExistsExpression(new Query({
            $from : new FromTable({
              table : 'code_master',
              $as : 'custom_code_master'
            }),
            $where : [
              new BinaryExpression(new ColumnExpression('custom_code_master', 'codeType'), '=', new ColumnExpression('code_master', 'codeType')),
              new BinaryExpression(new ColumnExpression('custom_code_master', 'code'), '=', new ColumnExpression('code_master', 'code')),
              new BinaryExpression(new ColumnExpression('custom_code_master', 'partyGroupCode'), '=', user.selectedPartyGroup.code)
            ]
          }), true)
        ])
      ])
      conditions = conditions
        ? new AndExpressions([conditions, partyGroupExpression])
        : partyGroupExpression
    }
  }
  return conditions
}
