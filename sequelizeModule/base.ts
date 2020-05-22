import { IConditionalExpression, OrExpressions, AndExpressions } from 'node-jql'
import { JwtPayload, JwtPayloadRole } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'

interface Selected {
  group: string
  roles: any[]
}

export default async function getDefaultParams(
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    const roles = user.selectedRoles || []
    if (roles.length) {
      const rolesExpressions = roles.reduce((all: Selected[], result: JwtPayloadRole) => {
        const sameGroupIndex = all.findIndex(t => t.group === result.roleGroup) // is same group
          if (result && result.filter && result.filter[this.repository.getTableName()]) {
            const { jql } = result.filter[this.repository.getTableName()]
            if (jql) {
              if (sameGroupIndex > -1) {
                const roles = all[sameGroupIndex].roles
                roles.push(jql)
                all.splice(sameGroupIndex, 1, {
                  group: result.roleGroup,
                  roles,
                })
              } else {
                all.push({ group: result.roleGroup, roles: [jql] })
              }
            }
          }
          return all
        }, [])
        .map((r: any) => new OrExpressions({ expressions: r.roles }))
      if (rolesExpressions && rolesExpressions.length) {
        conditions = conditions
          ? new AndExpressions({ expressions: [conditions, ...rolesExpressions] })
          : new AndExpressions({ expressions: rolesExpressions })
      }
    }
  }

  return conditions
}
