import { JqlDefinition } from 'modules/report/interface'

export default {
  extend: 'card/yoyprofit-airline-frc',
  override: def => {
    console.debug('override', 'yoyprofit-airline')
    def.jqls.push({
      type: 'postProcess',
      async postProcess(params, prevResult: any[], user): Promise<any[]> {
        const { moment } = await this.preparePackages(user)
        console.debug('added postprocess', 'yoyprofit-airline')
        return prevResult.map(row => {
          const row_: any = { carrierName: row.carrierName }
          for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
            const month = m === 12 ? 'total' : moment().month(m).format('MMMM')
            const to = `${month}_grossProfit`
            for (const type of ['F', 'R', 'C']) {
              const from = `${month}_${type}_grossProfit`
              row_[to] = (row_[to] || 0) + row[from]
            }
          }
          return row_
        })
      }
    })
    return def
  },
} as JqlDefinition
