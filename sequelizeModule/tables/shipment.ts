import { IConditionalExpression, OrExpressions, AndExpressions, BinaryExpression, ColumnExpression, FunctionExpression, InExpression, Query, ResultColumn, FromTable, MathExpression } from 'node-jql'
import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { joinData } from 'utils/helper'

export const setDataFunction = {
  partyGroupCode: async({ partyGroupCode }, user: JwtPayload) => {
    if (user) {
      return user.selectedPartyGroup.code || partyGroupCode
    }
    return partyGroupCode
  },
  bookingNo: async({ shipmentBooking = [] }) => joinData(shipmentBooking, 'bookingNo'),
  contractNos: async({ shipmentContainers = [] }: any) => joinData(shipmentContainers, 'contractNo'),
  carrierBookingNos: async({ shipmentContainers = [] }: any) => joinData(shipmentContainers, 'carrierBookingNo'),
  containerNos: async({ shipmentContainers = [] }: any) => joinData(shipmentContainers, 'containerNo'),
  poNos: async({ shipmentPo = [] }: any) => joinData(shipmentPo, 'poNo'),
  class: async({ isDirect, isCoload }: any) => {
    return `${isDirect ? 'D' : ''}${isCoload ? 'C' : ''}`
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
    if (user.authTypeCode === 'person' && user.parties && user.parties.length) {
      const selectedPartyGroupCode = user.selectedPartyGroup ? user.selectedPartyGroup.code : null
      const partyTypesExpressions = user.parties.reduce(
        (selectedPartyType: BinaryExpression[], party: JwtPayloadParty) => {


          // if (
          //   party.partyGroupCode === selectedPartyGroupCode &&
          //   party.types &&
          //   party.types.length
          // ) {

          if (party.partyGroupCode === selectedPartyGroupCode)
          {

            if (!(party.types && party.types.length))
            {
              throw new Error(`party id : ${party.id} missing types in shipment getDefaultParams`)
            }

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
                      'shipment_party',
                      `${type === 'forwarder' ? 'office' : type}PartyId`
                    )
                  : new MathExpression(
                      new ColumnExpression('shipment_party', 'flexData'),
                      '->>',
                      `$.${type}PartyId`
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
          new ColumnExpression('shipment', 'id'),
          false,
          new Query({
            $select: [new ResultColumn(new ColumnExpression('shipment_party', 'shipmentId'))],
            $from: new FromTable('shipment_party'),
            $where: new OrExpressions({ expressions: partyTypesExpressions }),
          })
        )
        conditions = conditions ? new AndExpressions([conditions, or]) : or
      }
    }
    if (user.authTypeCode === 'person' && user.thirdPartyCode && user.thirdPartyCode.erp) {
      const salesmanExpression = new OrExpressions({
        expressions: [
          new BinaryExpression(
            new ColumnExpression('shipment', 'rSalesmanPersonCode'),
            '=',
            user.thirdPartyCode.erp
          ),
          new BinaryExpression(
            new ColumnExpression('shipment', 'cSalesmanPersonCode'),
            '=',
            user.thirdPartyCode.erp
          ),
          new BinaryExpression(
            new ColumnExpression('shipment', 'sSalesmanPersonCode'),
            '=',
            user.thirdPartyCode.erp
          ),
        ],
      })
      conditions = conditions
        ? new AndExpressions([conditions, salesmanExpression])
        : salesmanExpression
    }
  }

  return conditions
}
