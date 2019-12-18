import _ = require('lodash')

const app = {
  constants: {
    // DEMO KEY
    url: 'http://localhost:8081',
    // url: 'http://192.168.3.133:8081',
    // url: 'https://360demo-api.swivelsoftware.asia',
    authorizationToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInVzZXJuYW1lIjoiZGVidWdAZGVidWcuY29tIiwiaWF0IjoxNTY5Mzc3NjA4LCJleHAiOjE1NjkzNzc5MDh9.0R-G76TNIXi_4tkmvogMBhfO9DF5FRp3iHJsxaPX4m0',
    refreshToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInVzZXJuYW1lIjoiZGVidWdAZGVidWcuY29tIiwiaWF0IjoxNTY5Mzc3NjA4fQ.234fxezQv-254GS1auNlRMiCPiTA7OspAPycUAZjgV0',

    primaryKeySeperator : '|'

  },
  method: 'GET', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any, constants: { [key: string]: any }) => {
    const [jobNo, houseNo, division] = body['options'].split(constants.primaryKeySeperator)
    return `${constants.url}/api/bill/hbl/${encodeURIComponent(jobNo)}/${encodeURIComponent(houseNo)}/${encodeURIComponent(division)}`
  },
  requestHandler: (headers: any, body: any, constants: { [key: string]: any }) => ({
    headers: {
      'x-no-redis': true,
      'authorization': `Bearer ${constants.authorizationToken}`,
      'x-refresh-token': `${constants.refreshToken}`,
    },
  }),
  responseHandler: (
    response: { responseBody: any; responseOptions: any },
    constants: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    try {
      const data = JSON.parse(response.responseBody)
      const flexDataData = data.flexData ? data.flexData.data || {} : {}
      for (const party of data.transactionParties || []) {
        const role = helper.convertParty(party.roleCode)
        let address = party.address1
        address = party.address2 ? `${address}\n${party.address2}` : address
        address = party.address3 ? `${address}\n${party.address3}` : address
        address = party.address4 ? `${address}\n${party.address4}` : address
        address = party.address5 ? `${address}\n${party.address5}` : address
        if (role.flexData) {
          flexDataData['moreParty'] = [...(flexDataData['moreParty'] || []), role.name]

          // warning: this is the old360 partyId
          flexDataData[`${role.name}PartyId`] = _.get(party, 'party.id', '')

          flexDataData[`${role.name}PartyCode`] = _.get(party, 'party.customerPartyCode', '')

          flexDataData[`${role.name}PartyName`] =
            _.get(party, 'name', null) || _.get(party, 'party.partyName', '')

          flexDataData[`${role.name}PartyContactName`] =
            _.get(party, 'contact', null) || _.get(party, 'party.contact', null)
          flexDataData[`${role.name}PartyContactEmail`] =
            _.get(party, 'email', null) || _.get(party, 'party.email', null)
          flexDataData[`${role.name}PartyContactPhone`] =
            _.get(party, 'phone', null) || _.get(party, 'party.phone', null)
          flexDataData[`${role.name}PartyAddress`] =
            address && address.trim() ? address.trim() : null
          flexDataData[`${role.name}PartyCityCode`] = _.get(party, 'cityCode', null)
          flexDataData[`${role.name}PartyStateCode`] = null
          flexDataData[`${role.name}PartyCountryCode`] = _.get(party, 'country', null)
          flexDataData[`${role.name}PartyZip`] = null
        } else {
          // warning: this is the old360 partyId
          data[`${role.name}PartyId`] = _.get(party, 'party.id', '')

          data[`${role.name}PartyCode`] = _.get(party, 'party.customerPartyCode', '')

          data[`${role.name}PartyName`] =
            _.get(party, 'name', null) || _.get(party, 'party.partyName', '')
          data[`${role.name}PartyContactName`] =
            _.get(party, 'contact', null) || _.get(party, 'party.contact', null)
          data[`${role.name}PartyContactEmail`] =
            _.get(party, 'email', null) || _.get(party, 'party.email', null)
          data[`${role.name}PartyContactPhone`] =
            _.get(party, 'phone', null) || _.get(party, 'party.phone', null)
          data[`${role.name}PartyAddress`] = address && address.trim() ? address.trim() : null
          data[`${role.name}PartyCityCode`] = _.get(party, 'cityCode', null)
          data[`${role.name}PartyStateCode`] = null
          data[`${role.name}PartyCountryCode`] = _.get(party, 'country', null)
          data[`${role.name}PartyZip`] = null
        }
      }
      for (const date of data.transactionDates || []) {
        const code = helper.convertDate(date.dateCode)
        if (code.flexData) {
          flexDataData['moreDate'] = [...(flexDataData['moreDate'] || []), code.name]
          flexDataData[`${code.name}DateEsimated`] = date.revisedEstimated || date.estimated
          flexDataData[`${code.name}DateActual`] = date.actual
          flexDataData[`${code.name}DateRemark`] = date.caption
        } else {
          data[`${code.name}DateEsimated`] = date.revisedEstimated || date.estimated
          data[`${code.name}DateActual`] = date.actual
          data[`${code.name}DateRemark`] = date.caption
        }
      }

      data.flexData = { data: flexDataData }
      data['departureDateEstimated'] =
        data['departureDateEstimated'] || data['estimatedDepartureDate'] || null
      data['arrivalDateEstimated'] =
        data['arrivalDateEstimated'] || data['estimatedArrivalDate'] || null
      data['primaryKey'] = `${data['jobNo']}${constants.primaryKeySeperator}${data['houseNo']}${constants.primaryKeySeperator}${data['division']}`
      return {
        responseBody: data,
        responseOptions: response.responseOptions,
      }
    } catch (e) {}
    throw new Error('Fail to get the data')
  },
}

export default app
