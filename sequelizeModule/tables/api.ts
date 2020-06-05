import { IConditionalExpression, OrExpressions, AndExpressions, BinaryExpression, ColumnExpression, FunctionExpression, InExpression, Query, ResultColumn, FromTable } from 'node-jql'
import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import sha256 = require('sha256')
import randomstring = require('randomstring')

export const setDataFunction = {
  partyGroupCode: async({ partyGroupCode }, user: JwtPayload) => {
    if (user) {
      return user.selectedPartyGroup.code || partyGroupCode
    }
    return partyGroupCode
  },
  refreshToken: async({ password }) => {
    const finalPassword = password || randomstring.generate({ length: 8, charset: 'alphabetic' })
    return sha256(finalPassword)
  }
}

export default async function getDefaultParams(
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    if (user.selectedPartyGroup) {
      const partyGroupExpression = new BinaryExpression(
        new ColumnExpression('shipment', 'partyGroupCode'),
        '=',
        user.selectedPartyGroup.code
      )
      conditions = conditions
        ? new AndExpressions([conditions, partyGroupExpression])
        : partyGroupExpression
    }
  }
  return conditions
}
