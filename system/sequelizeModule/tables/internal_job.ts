import { IQueryParams } from "classes/query"
import { JwtPayload } from "modules/auth/interfaces/jwt-payload"
import { AndExpressions, BinaryExpression, ColumnExpression, IConditionalExpression, Value } from "node-jql"
import { Transaction } from "sequelize/types"

export default async function getDefaultParams(
  params: IQueryParams,
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    const partyGroupCheck = new BinaryExpression(new  ColumnExpression('internal_job', 'partyGroupCode'), '=', new Value(user.selectedPartyGroup.code))
    conditions = conditions ? new AndExpressions([conditions, partyGroupCheck]) : partyGroupCheck
  }
  return conditions
}