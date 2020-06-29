import { IConditionalExpression, OrExpressions, AndExpressions, BinaryExpression, ColumnExpression, FunctionExpression, InExpression, Query, ResultColumn, FromTable } from 'node-jql'
import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Op } from 'sequelize'
import moment = require('moment')
import { Booking } from 'models/main/booking'

export const setDataFunction = {
  partyGroupCode: async({ partyGroupCode }: Booking, user: JwtPayload) => {
    if (user) {
      return user.selectedPartyGroup.code || partyGroupCode
    }
    return partyGroupCode
  },
  bookingNo: async({ bookingNo }: Booking, user: JwtPayload) => {
    if (!bookingNo) {
      let userPartyGroupId: string = (user ? user.selectedPartyGroup.id : '').toString()
      if (userPartyGroupId.length === 0) {
        userPartyGroupId = `00`
      } else if (userPartyGroupId.length === 1) {
        userPartyGroupId = `0${userPartyGroupId}`
      } else if (userPartyGroupId.length === 2) {
        userPartyGroupId = `0${userPartyGroupId}`
      } else if (userPartyGroupId.length === 3) {
        userPartyGroupId = `${userPartyGroupId}`
      }
      const date = moment.utc().format('YYMMDD')
      let random = Math.floor(Math.random() * 9999).toString()
      if (random.length === 3) {
        random = `0${random}`
      } else if (random.length === 2) {
        random = `00${random}`
      } else if (random.length === 1) {
        random = `000${random}`
      } else if (random.length === 0) {
        random = `0000`
      }
      return `${userPartyGroupId}-${date}${random}`
    }
    return bookingNo
  },
  rSalesmanPersonCode: async ({ bookingParty }: Booking, user: JwtPayload, transaction: Transaction, context: any) => {
    if (bookingParty.controllingCustomerPartyCode) {
      const party = await context.partyTableService.findOneWithScope(
        'onlyItself',
        {
          where: { thirdPartyCode: { erp: bookingParty.controllingCustomerPartyCode } }
        } as any,
        user,
        transaction
      )
      if (party && party.flexData) {
        return party.flexData.salesmanCode
      }
    }
    return null
  },
  sSalesmanPersonCode: async ({ bookingParty }: Booking, user: JwtPayload, transaction: Transaction, context: any) => {
    if (bookingParty.shipperPartyCode) {
      const party = await context.partyTableService.findOneWithScope(
        'onlyItself',
        {
          where: { thirdPartyCode: { erp: bookingParty.shipperPartyCode } }
        } as any,
        user,
        transaction
      )
      if (party && party.flexData) {
        return party.flexData.salesmanCode
      }
    }
    return null
  },
  cSalesmanPersonCode: async ({ bookingParty }: Booking, user: JwtPayload, transaction: Transaction, context: any) => {
    if (bookingParty.consigneePartyCode) {
      const party = await context.partyTableService.findOneWithScope(
        'onlyItself',
        {
          where: { thirdPartyCode: { erp: bookingParty.consigneePartyCode } }
        } as any,
        user,
        transaction
      )
      if (party && party.flexData) {
        return party.flexData.salesmanCode
      }
    }
    return null
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
        new ColumnExpression('booking', 'partyGroupCode'),
        '=',
        user.selectedPartyGroup.code
      )
      conditions = conditions
        ? new AndExpressions([conditions, partyGroupExpression])
        : partyGroupExpression
    }
    if (user.parties && user.parties.length) {
      const selectedPartyGroupCode = user.selectedPartyGroup ? user.selectedPartyGroup.code : null
      const partyTypesExpressions = user.parties.reduce(
        (selectedPartyType: BinaryExpression[], party: JwtPayloadParty) => {
          if (
            party.partyGroupCode === selectedPartyGroupCode &&
            party.types &&
            party.types.length
          ) {
            selectedPartyType = selectedPartyType.concat(
              party.types.map((type: string) => {
                const con = [
                  'shipper',
                  'consignee',
                  'office',
                  'forwarder',
                  'roAgent',
                  'linerAgent',
                  'agent',
                  'controllingCustomer',
                ].includes(type)
                  ? new ColumnExpression(
                      'booking_party',
                      `${type === 'office' ? 'forwarder' : type}PartyId`
                    )
                  : new FunctionExpression(
                      'JSON_UNQUOTE',
                      new FunctionExpression(
                        'JSON_EXTRACT',
                        new ColumnExpression('booking_party', 'flexData'),
                        `$.${type}PartyId`
                      )
                    )
                return new BinaryExpression(con, '=', party.id)
              })
            )
          }
          return selectedPartyType
        },
        []
      )
      if (partyTypesExpressions && partyTypesExpressions.length) {
        const or = new InExpression(
          new ColumnExpression('booking', 'id'),
          false,
          new Query({
            $select: [new ResultColumn(new ColumnExpression('booking_party', 'bookingId'))],
            $from: new FromTable('booking_party'),
            $where: new OrExpressions({ expressions: partyTypesExpressions }),
          })
        )
        conditions = conditions ? new AndExpressions([conditions, or]) : or
      }
    }
  }
  return conditions
}
