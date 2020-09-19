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
      is: 'AsyncAutoComplete',
      props: {
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
        'item-value': 'portCode',
        'return-object': true
      }
    }
  },
  {
    name: 'portOfDischargeCode',
    component: {
      is: 'AsyncAutoComplete',
      props: {
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
        'item-value': 'portCode',
        'return-object': true
      }
    }
  },
  {
    name: 'incoTermsCode',
    component: {
      is: 'AsyncSelect',
      props: {
        axiosParams: {
          url: 'api/code/query/code_master',
          method: 'POST',
          data: {
            subqueries: {
              codeType: {
                value: 'INCOTERMS'
              }
            }
          }
        },
        showValue: false,
        'item-text': 'code',
        'item-value': 'code'
      }
    }
  },
  {
    name: 'serviceCode',
    component: {
      is: 'AsyncSelect',
      props: {
        axiosParams: {
          url: 'api/code/query/code_master',
          method: 'POST',
          data: {
            subqueries: {
              codeType: {
                value: 'SERVTYPE'
              }
            }
          }
        },
        showValue: false,
        'item-text': 'name',
        'item-value': 'code'
      }
    }
  }/* ,
  {
    name: 'anyParty',
    component: {
      is: 'AsyncAutoComplete',
      props: {
        searchTextParams: {
          url: 'api/party/query/party_auto_suggest',
          method: 'POST',
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
        'item-value': 'erpCode',
        'return-object': true
      }
    },
    handle(entity: any, name: string): string[] {
      // TODO
      return []
    }
  } */
]