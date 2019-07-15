

import { JwtPayload } from 'modules/auth/interfaces/jwt-payload';
import { Transaction } from 'sequelize';
import deepdiff = require('deep-diff')

const entityInvitationDetail = {

  roleList : ["shipper","consignee","forwarder"]
}

export default async function entityCreateInvitaion (that:any,entity: any, tableName: string, user?: JwtPayload, transaction?: Transaction) {

  console.log('start entityCreateInvitaion')
  const partyGroupCode = entity.partyGroupCode

  if (!(partyGroupCode && partyGroupCode.length)) {
    throw new Error('partyGroupCode not found')
  }

  const repo = 'customer-' + partyGroupCode

  const roleList = entityInvitationDetail.roleList

  // used to check if this email is processed
  const personMap = {} as {
    [email: string]: Person
  }

  // used to check if the Party is created
  const createPartyMap = {} as {
    [partyName: string]: Party
  }

  // used to check if the Party is created
  const partyIdMap = {} as {
    [party: string]: number
  }

  // result containing what to update
  const returnEntity = {}

  // -------------------------------------------

  // findOrCreate a Party, for party that are created before, they will be stored in partyMap

  async function processParty (role: string)
  {

    if (entity[role + 'PartyName'] && entity[role + 'PartyName'].length)
    {

      const partyName = entity[role + 'PartyName'] as string
      let party = createPartyMap[partyName.trim()]

      if (party){

        party.types.push({
          type : role
        } as PartyType)

        createPartyMap[partyName.trim()] = party
      }

      else {

        party = {

          isBranch: false,
          partyGroupCode: entity['PartyGroupCode'],
          erpCode: entity[role + 'PartyCode'],
          shortName: '',
          groupName: '',

          name: entity[role + 'PartyName'],

          email: entity[role + 'PartyEmail'],
          phone: entity[role + 'PartyPhone'],
          fax: entity[role + 'PartyFax'],

          address: entity[role + 'PartyAddress'],
          types : [
            {
              type : role
            }
          ],

          countryCode: entity[role + 'PartyCountryCode'],
          stateCode: entity[role + 'PartyStateCode'],
          cityCode: entity[role + 'PartyCityCode'],
          zip: entity[role + 'Zip']

        } as Party

      }

      createPartyMap[partyName.trim()] = party

      return party

    }

    return undefined

  }

  async function createParty ()
  {

    // create all party in the createPartyMap

    for (const [partyName, partyData] of Object.entries(createPartyMap)) {

      if (partyData !== undefined)
      {
        const party = await that.partyService.save(partyData, user, transaction)
        createPartyMap[partyName] = party
      }
    }

    // map createPartyMap into partyIdMap
    console.log(roleList, 'roleList')
    for (const role of roleList)
    {

      const partyId = entity[role + 'PartyId'] as number

      if (partyId && partyId != null)
      {
        partyIdMap[role] = partyId
      }

      else if (entity[role + 'PartyName'] && entity[role + 'PartyName'].length){

        const partyName = entity[role + 'PartyName']
        const party = createPartyMap[partyName.trim()]
        partyIdMap[role] = party.id

      }

    }
  }

  // change the entity Contact into a Person data
  async function processPerson (rolePartyId: number, contactEmail: string, contactName: string, contactPhone?: string) {
    let firstName: string, lastName: string, displayName: string

    let person = personMap[contactEmail]

    if (person) {
      person.parties.push(
        {
          id: rolePartyId
        } as Party
      )
    }

    else if (contactEmail && contactEmail.length) {

      // prepare a completely new person Data
      const contacts = [] as PersonContact[]

      if ((contactName || '').indexOf(' ') >= 0) {
        firstName = contactName.split(' ')[0]
        lastName = contactName.split(' ')[1]
        displayName = contactName
      }
      else {
        firstName = contactName,
          displayName = contactName
      }

      contacts.push(
        {
          contactType: 'email',
          content: contactEmail
        } as PersonContact

      )

      // if phone exists, push it into contact
      if (contactPhone && contactPhone.length) {
        contacts.push(
          {
            contactType: 'phone',
            content: contactPhone
          } as PersonContact

        )
      }

      person = {

        userName: contactEmail,
        firstName,
        lastName,
        displayName,
        contacts,
        parties: [
          {
            id: rolePartyId
          }
        ]

      } as Person

    }

    personMap[contactEmail] = person
    return person

  }

  async function createPerson () {

    for (const [email, personData] of Object.entries(personMap)) {

      if (personData !== undefined)
      {
        const invitation = await that.createInvitation(personData, partyGroupCode, user, transaction)
        personMap[email] = invitation.person
      }
    }

  }

  // -------------- Main Function ---------------

  // create all Party in advance
  for (const role of roleList) {

    const rolePartyId = entity[role + 'PartyId']
    if (!rolePartyId)
    {
      await processParty(role)
    }

  }

  // create the all the party
  await createParty()

  // prepare all the person Data
  for (const role of roleList) {

    // find the first person
    const roleFirstContactPersonId = entity[role + 'PartyContactPersonId']
    const roleFirstContactEmail = entity[role + 'PartyContactEmail'] as string

    const roleParyId = partyIdMap[role]

    // If personId is given, assuming all data is correct
    if (!(roleFirstContactPersonId && roleFirstContactPersonId !== null)) {

      const roleFirstContactName = entity[role + 'PartyContactName'] as string
      const roleFirstContactPhone = entity[role + 'PartyContactPhone'] as string

      // invitation created
      await processPerson(roleParyId, roleFirstContactEmail, roleFirstContactName, roleFirstContactPhone)

    }

    // find the rest
    const roleContactList = entity[role + 'PartyContacts']
    const updatedRoleContactList = []

    if (roleContactList) {

      for (const rolecontact of roleContactList) {

        // if id is given will not do anthing
        if (!(rolecontact['PersonId'] && rolecontact['PersonId'] !== null)) {
          // invitation created
          await processPerson(roleParyId, rolecontact['Email'], rolecontact['Name'], rolecontact['Phone'])

        }

      }

    }

    returnEntity[role + 'PartyContacts'] = updatedRoleContactList
  }

  // create all person
  await createPerson()

  // map back all person and party
  for (const role of roleList) {

    const rolePartyId = entity[role + 'PartyId']

    // map party Id
    if (!(rolePartyId && rolePartyId !== null)) {

      returnEntity[role + 'PartyId'] = partyIdMap[role]

    }

    // find the first person
    const roleFirstContactPersonId = entity[role + 'PartyContactPersonId']
    const roleFirstContactEmail = entity[role + 'PartyContactEmail'] as string

    // only will perform update if Id is empty and email exist
    if (!(roleFirstContactPersonId && roleFirstContactPersonId !== null) && roleFirstContactEmail && roleFirstContactEmail.length) {
      returnEntity[role + 'PartyContactPersonId'] = personMap[roleFirstContactEmail].id
    }

    // find the rest
    const roleContactList = entity[role + 'PartyContacts']
    const updatedRoleContactList = []

    if (roleContactList) {

      for (const rolecontact of roleContactList) {

        // if id is given will not do anthing
        // only will perform update if Id is empty and email exist
        if (!(rolecontact['PersonId'] && rolecontact['PersonId'] !== null && rolecontact['Email'] && rolecontact['Email'].length)) {

          rolecontact['PersonId'] = personMap[rolecontact['Email']].id
        }

        updatedRoleContactList.push(rolecontact)

      }

    }

    returnEntity[role + 'PartyContacts'] = updatedRoleContactList

  }



  const jsondiffpatch = require('jsondiffpatch').create()

  console.log(returnEntity,'returnEntity')

  const checkEntity = {...(entity.dataValues),...returnEntity}

  console.log(checkEntity,'checkEntity')
  const diff = jsondiffpatch.diff(entity, checkEntity)
  if (diff)
  {
    return returnEntity
  }

  return undefined

}

// export default async function (


//   booking: {
//     partyGroupCode: string
//   },

//   helper: {
//     dataService: any
//   }
// ) {





// }
