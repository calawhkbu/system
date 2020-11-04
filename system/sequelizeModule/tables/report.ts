import { IQueryParams } from "classes/query"
import { JwtPayload } from "modules/auth/interfaces/jwt-payload"
import { AndExpressions, BinaryExpression, ColumnExpression, IConditionalExpression } from "node-jql"
import { Transaction } from "sequelize/types"

export default async function getDefaultParams(
  params: IQueryParams,
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    const partyGroupCodeExpression = new BinaryExpression(new ColumnExpression('report', 'partyGroupCode'), '=', user.selectedPartyGroup.code)
    conditions = conditions ? new AndExpressions([conditions, partyGroupCodeExpression]) : partyGroupCodeExpression
  }

  return conditions
}