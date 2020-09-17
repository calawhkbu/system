export const criteriaFields = [
  {
    name: 'moduleTypeCode',
    component: {
      is: 'AsyncSelect',
      props: {
        axiosParams: {
          url: 'api/code/query/code_master',
          method: 'POST',
          data: {
            subqueries: {
              codeType: {
                value: 'MODULE'
              }
            }
          }
        },
        'item-text': 'name',
        'item-value': 'code'
      }
    }
  },
  {
    name: 'boundTypeCode',
    component: {
      is: 'AsyncSelect',
      props: {
        axiosParams: {
          url: 'api/code/query/code_master',
          method: 'POST',
          data: {
            subqueries: {
              codeType: {
                value: 'BOUND'
              }
            }
          }
        },
        'item-text': 'name',
        'item-value': 'code'
      }
    }
  },
  {
    name: 'portOfLoadingCode',
    component: {
      is: 'AsyncAutoSuggest',
      props: {
        containerProps: {
          style: { width: '100%' }
        },
        searchValueParams: {
          method: 'POST',
          url: 'api/location/query/location',
          data: {
            subqueries: {
              portCodeLike: {
                value: '{{context.autoSuggestModel}}'
              }
            }
          }
        },
        searchTextParams: {
          method: 'POST',
          url: 'api/location/query/location',
          data: {
            subqueries: {
              q: {
                value: '{{context.search}}'
              }
            },
            limit: 5
          }
        },
        'item-text': 'name',
        'item-value': 'portCode'
      }
    }
  },
  {
    name: 'portOfDischargeCode',
    component: {
      is: 'AsyncAutoSuggest',
      props: {
        containerProps: {
          style: { width: '100%' }
        },
        searchValueParams: {
          method: 'POST',
          url: 'api/location/query/location',
          data: {
            subqueries: {
              portCodeLike: {
                value: '{{context.autoSuggestModel}}'
              }
            }
          }
        },
        searchTextParams: {
          method: 'POST',
          url: 'api/location/query/location',
          data: {
            subqueries: {
              q: {
                value: '{{context.search}}'
              }
            },
            limit: 5
          }
        },
        'item-text': 'name',
        'item-value': 'portCode'
      }
    }
  }
]