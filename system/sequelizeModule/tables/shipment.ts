import { IConditionalExpression, OrExpressions, AndExpressions, BinaryExpression, ColumnExpression, FunctionExpression, InExpression, Query, ResultColumn, FromTable, MathExpression } from 'node-jql'
import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { joinData } from 'utils/helper'
import { Shipment } from 'models/main/shipment'

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
  },
  quantity: async({ quantity = null, shipmentContainers = [] }: Shipment) => {
    if (!quantity) {
      let totalQuantity = 0
      for (const { quantity } of shipmentContainers) {
        const finalnumber = (typeof quantity === 'number' ? (quantity || 0) : (quantity ? parseInt(quantity) : 0))
        totalQuantity += (finalnumber || 0)
      }
      return totalQuantity
    }
    return quantity
  },
  quantityUnit: async ({ quantityUnit, shipmentContainers = [] }: Shipment) => {
    if (!quantityUnit) {
      const units = []
      for (const { quantityUnit } of shipmentContainers) {
        if (!units.find(u => u === quantityUnit)) {
          units.push(quantityUnit)
        }
      }
      return units.join(',')
    }
    return quantityUnit
  },
  grossWeight: async({ grossWeight = null, shipmentContainers = [] }: Shipment) => {
    if (!grossWeight) {
      let totalGrossWeight = 0
      for (const { grossWeight, weightUnit = 'KGs' } of shipmentContainers) {
        const finalnumber = (typeof grossWeight === 'number' ? (grossWeight || 0) : (grossWeight ? parseInt(grossWeight) : 0))
        totalGrossWeight += (finalnumber || 0) / (weightUnit === 'LBs' ? 2.205 : 1)
      }
      return totalGrossWeight.toFixed(6)
    }
    return grossWeight
  },
  chargeableWeight: async({ chargeableWeight = null, shipmentContainers = [] }: Shipment) => {
    if (!chargeableWeight) {
      let totalChargeableWeight = 0
      for (const { grossWeight, weightUnit = 'KGs' } of shipmentContainers) {
        const finalnumber = (typeof grossWeight === 'number' ? (grossWeight || 0) : (grossWeight ? parseInt(grossWeight) : 0))
        totalChargeableWeight += ((finalnumber || 0) / (weightUnit === 'LBs' ? 2.205 : 1))
      }
      return totalChargeableWeight.toFixed(6)
    }
    return chargeableWeight
  },
  volumeWeight: async ({ volumeWeight = null, shipmentContainers = [] }: Shipment) => {
    if (!volumeWeight) {
      return 0
    }
    return volumeWeight
  },
  weightUnit: async ({ weightUnit = null, shipmentContainers = [] }: Shipment) => {
    if (!weightUnit) {
      return 'KGs'
    }
    return weightUnit
  },
  cbm: async({ cbm = null, shipmentContainers = [] }: Shipment) => {
    if (!cbm) {
      return 0
    }
    return cbm
  },
  teu: async ({ teu = null, shipmentContainers = [] }: Shipment) => {
    if (!teu) {
      let total = 0
      for (const { loadTEU } of shipmentContainers) {
        const finalnumber = (typeof loadTEU === 'number' ? (loadTEU || 0) : (loadTEU ? parseInt(loadTEU) : 0))
        total += (finalnumber || 0)
      }
      return total.toFixed(6)
    }
    return teu
  },
  container20: async({ container20 = null, shipmentContainers = [] }: Shipment) => {
    if (!container20) {
      let total = 0
      for (const { containerType, loadCount } of shipmentContainers) {
        if (containerType && containerType.startsWith('20')) {
          const finalnumber = (typeof loadCount === 'number' ? (loadCount || 0) : (loadCount ? parseInt(loadCount) : 0))
          total += (finalnumber || 0)
        }
      }
      return total.toFixed(6)
    }
    return container20
  },
  container40: async({ container40 = null, shipmentContainers = [] }: Shipment) => {
    if (!container40) {
      let total = 0
      for (const { containerType, loadCount } of shipmentContainers) {
        if (containerType && containerType.startsWith('40')) {
          const finalnumber = (typeof loadCount === 'number' ? (loadCount || 0) : (loadCount ? parseInt(loadCount) : 0))
          total += (finalnumber || 0)
        }
      }
      return total.toFixed(6)
    }
    return container40
  },
  containerHQ: async({ containerHQ = null, shipmentContainers = [] }: Shipment) => {
    if (!containerHQ) {
      let total = 0
      for (const { containerType, loadCount } of shipmentContainers) {
        if (containerType && containerType.startsWith('45')) {
          const finalnumber = (typeof loadCount === 'number' ? (loadCount || 0) : (loadCount ? parseInt(loadCount) : 0))
          total += (finalnumber || 0)
        }
      }
      return total.toFixed(6)
    }
    return containerHQ
  },
  containerOthers: async({ containerOthers = null, shipmentContainers = [] }: Shipment) => {
    if (!containerOthers) {
      let total = 0
      for (const { containerType, loadCount } of shipmentContainers) {
        if (containerType && !containerType.startsWith('20') && !containerType.startsWith('40') && !containerType.startsWith('45')) {
          const finalnumber = (typeof loadCount === 'number' ? (loadCount || 0) : (loadCount ? parseInt(loadCount) : 0))
          total += (finalnumber || 0)
        }
      }
      return total.toFixed(6)
    }
    return containerOthers
  },
  report: async({ shipmentContainers = [], shipmentCargos = [] }: Shipment) => {
    return {

    }
  }
}

export const dateTimezoneMapping = {
  portOfLoading: [
    'departure',
    'oceanBill',
    'cargoReady',
    'scheduleAssigned',
    'scheduleApproaved',
    'spaceConfirmation',
    'shipmentSubmit',
    'cyCutOff',
    'documentCutOff',
    'pickup',
    'shipperLoad',
    'returnLoad',
    'cargoReceipt',
    'shipperDocumentSubmit',
    'shipperInstructionSubmit',
    'houseBillDraftSubmit',
    'houseBillConfirmation',
    'masterBillReleased',
    'preAlertSend',
    'ediSend',
    'cargoRolloverStatus',
    'sentToShipper',
    'gateIn',
    'loadOnboard',
    'customClearanceLoadingPort'
  ],
  portOfDischarge: [
    'arrival',
    'inboundTransfer',
    'onRail',
    'arrivalAtDepot',
    'availableForPickup',
    'pickupCargoBeforeDemurrage',
    'finalCargo',
    'cargoPickupWithDemurrage',
    'finalDoorDelivery',
    'returnEmptyContainer',
    'sentToConsignee',
    'customClearanceDestinationPort'
  ]
}

export const fixedPartyKeys = [
  'shipper',
  'consignee',
  'office',
  'roAgent',
  'linerAgent',
  'agent',
  'controllingCustomer',
  'notifyParty'
]

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
          if (party.partyGroupCode === selectedPartyGroupCode) {
            for (const fixPartyKey of fixedPartyKeys) {
              selectedPartyType.push(new BinaryExpression(new ColumnExpression('shipment_party', `${fixPartyKey}PartyId`), '=', party.id))
            }
            if (party.types && party.types.length > 0) {
              for (const type of party.types) {
                selectedPartyType.push(
                  new BinaryExpression(
                    [...fixedPartyKeys, 'forwarder'].includes(type)
                      ? new ColumnExpression(
                          'shipment_party',
                          `${type === 'office' ? 'forwarder' : type}PartyId`
                        )
                      : new MathExpression(
                          new ColumnExpression('shipment_party', 'flexData'),
                          '->>',
                          `$.${type}PartyId`
                        ),
                    '=',
                    party.id)
                )
              }
            }
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
