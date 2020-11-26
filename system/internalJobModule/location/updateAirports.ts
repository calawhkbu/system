import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import axios from 'axios'
import { Location } from 'models/main/location'
import { Op, QueryTypes } from 'sequelize'
import { Job } from 'modules/internal-job/job'
import parse = require('csv-parse/lib/sync')
import { IQueryParams } from 'classes/query'

export const filters: any[] = [
  {
    name: 'system',
    type: 'boolean'
  },
  {
    name: 'per',
    type: 'list',
    props: {
      items: [
        {
          value: 10,
          label: '10'
        },
        {
          value: 20,
          label: '20'
        },
        {
          value: 50,
          label: '50'
        },
        {
          value: 100,
          label: '100'
        }
      ]
    }
  }
]

export default async function updateAirports(this: Job, params: IQueryParams, user: JwtPayload) {
  const subqueries = params.subqueries || {}
  const system = subqueries.system || false
  const per = +(subqueries.per && subqueries.per.value) || 100

  return await this.service.internalJobTableService.transaction(async transaction => {
    const countriesRes = await axios.get('https://raw.githubusercontent.com/jpatokal/openflights/master/data/countries.dat')
    const countries: any[][] = parse(countriesRes.data, {
      skip_empty_lines: true
    })

    const airportsRes = await axios.get('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat')
    const airports: any[][] = parse(airportsRes.data, {
      skip_empty_lines: true
    })

    function findCountry(value: string) {
      const country = countries.find(c => c[0] === value)
      if (country) {
        const countryCode = country[1]
        if (!countryCode) console.warn(`No IATA code for ${country[1]}`, 'updateAirports')
        return countryCode
      }
      else {
        console.warn(`Country not found "${value}"`, 'updateAirports')
      }
    }

    let locations: Location[] = []
    for (const airport of airports) {
      const portCode = airport[4]
      const countryCode = findCountry(airport[3])
      if (portCode !== '\\N' && countryCode) {
        locations.push({
          countryCode,
          locationCode: portCode, // TODO ???
          portCode,
          name: airport[2],
          moduleTypeCode: 'AIR',
          latitude: airport[6],
          longitude: airport[7],
          timezone: airport[11]
        } as Location)

        if (locations.length === per) {
          // filter exist 
          const existing = await this.service.locationTableService.find({ where: {
            partyGroupCode: system ? null : user.selectedPartyGroup.code,
            moduleTypeCode: 'AIR',
            portCode: { [Op.in]: locations.map(l => l.portCode) }
          } }, user, transaction)
          locations = locations.filter(l => !existing.find(e => l.portCode === e.portCode))

          // insert
          const records = await this.service.locationTableService.save(locations, user, transaction)
          console.debug(`Inserted ${locations.map(l => l.portCode).join(',')}`, 'updateAirports')

          // fix partyGroupCode
          if (system) {
            await this.service.locationTableService.query(`UPDATE location SET partyGroupCode = null WHERE id IN (${records.map(r => r.id).join(',')})`, { type: QueryTypes.UPDATE, transaction })
          }

          // reset
          locations = []
        }
      }
      else {
        console.warn(`No IATA code for "${airport[1]}"`, 'updateAirports')
      }
    }
  })
}
