import { NotImplementedException } from '@nestjs/common'

export default {
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException()
    return `${api.erp.url}/getschrptlist`
  },
  requestHandler: () => {
    return {
      headers: {
        'content-type': 'application/json',
      },
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    // parse results
    let responseBody = JSON.parse(JSON.parse(response.responseBody).d) as any[]

    // reformat
    responseBody = responseBody.reduce<any[]>((result, row) => {
      const card = result.find(({ id }) => id === row.zyh)
      if (!card) {
        result.push({
          id: row.zyh,
          reportingKey: 'dashboard',
          api: 'erp',
          category: 'Swivel ERP',
          name: row.title,
          component: {
            props: {
              defaultParams: {
                filters: {
                  type: {
                    value: row.zyd,
                  },
                },
              },
            },
          },
          layouts: {
            __BASE__: { h: 12, w: 6 },
          },
        })
      }
      return result
    }, [])

    return { ...response, responseBody }
  },
}
