import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'

interface Result {
  air: any[]
  sea: any[]
  agents: any[]
}

function processResult(result: any[], params: IQueryParams, moduleTypeCode: string): any[] {
  const subqueries = (params.subqueries = params.subqueries || {})
  let profitSummaryVariables = ['grossProfit']
  if (subqueries.profitSummaryVariables && subqueries.profitSummaryVariables !== true && 'value' in subqueries.profitSummaryVariables) {
    profitSummaryVariables = subqueries.profitSummaryVariables.value
  }
  return result.map(row => {
    const row_: any = { moduleTypeCode, agentCode: row.agentCode }
    for (const variable of profitSummaryVariables) {
      for (const key of Object.keys(row)) {
        if (key.endsWith(`_${variable}`)) {
          row_[key] = row[key]
        }
      }
    }
    return row_
  })
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const { moment } = await this.preparePackages(user)
        const subqueries = (params.subqueries = params.subqueries || {})
        if (subqueries.date && subqueries.date !== true && 'from' in subqueries.date) {
          const year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
          subqueries.date.from = moment()
            .year(year)
            .startOf('year')
            .format('YYYY-MM-DD')
          subqueries.date.to = moment()
            .year(year)
            .endOf('year')
            .format('YYYY-MM-DD')
        }
        return params
      }
    },
    {
      type: 'runParallel',
      jqls: [
        [
          {
            type: 'prepareParams',
            defaultResult: {},
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              params.subqueries.moduleTypeCode = {
                value: ['AIR']
              }
              return params
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit-agent'],
            onResult(data, params, prevResult: Result): Result {
              data = prevResult.air = processResult(data, params, 'AIR')
              if (!prevResult.agents) prevResult.agents = []
              for (const row of data) if (prevResult.agents.indexOf(row.agentCode) === -1) prevResult.agents.push(row.agentCode)
              return prevResult
            },
            onError(error, params, prevResult: Result): Result {
              if (error.message === 'INVALID_MODULE_TYPE') {
                prevResult.air = []
                return prevResult
              }
              throw error
            }
          }
        ],
        [
          {
            type: 'prepareParams',
            defaultResult: {},
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              params.subqueries.moduleTypeCode = {
                value: ['SEA']
              }
              return params
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit-agent'],
            onResult(data, params, prevResult: Result): Result {
              prevResult.sea = processResult(data, params, 'SEA')
              if (!prevResult.agents) prevResult.agents = []
              for (const row of data) if (prevResult.agents.indexOf(row.agentCode) === -1) prevResult.agents.push(row.agentCode)
              return prevResult
            },
            onError(error, params, prevResult: Result): Result {
              if (error.message === 'INVALID_MODULE_TYPE') {
                prevResult.sea = []
                return prevResult
              }
              throw error
            }
          }
        ]
      ]
    },
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        return {
          subqueries: {
            erpCodeIn: {
              value: prevResult.agents
            }
          }
        }
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['party', 'party_auto_suggest'],
      onResult(data, params, prevResult: Result): Result {
        prevResult.agents = data
        return prevResult
      }
    },
    {
      type: 'postProcess',
      postProcess(params, { air = [], sea = [], agents = [] }: Result): any[] {
        let result: any[] = air.concat(sea)

        result = result.reduce<any[]>((a, row) => {
          let row_ = a.find(r => r.agentCode === row.agentCode)
          if (!row_) {
            a.push(row_ = { agentCode: row.agentCode })
            const agent = agents.find(a => a.erpCode === row.agentCode)
            if (agent) row_.agentPartyName = agent.name || row.agentCode
          }
          for (const key of Object.keys(row)) {
            if (key !== 'agentCode' && key !== 'moduleTypeCode') {
              row_[`${row.moduleTypeCode}_${key}`] = row[key]
              row_[`total_${key}`] = (row_[`total_${key}`] || 0) + row[key]
            }
          }
          return a
        }, [])

        if (air.length && sea.length) {
          result = result.sort((l, r) => r.total_total_grossProfit - l.total_total_grossProfit)
        }

        return result
      }
    }
  ]
} as JqlDefinition