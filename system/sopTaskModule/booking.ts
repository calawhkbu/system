import { checkAutoSelectAnyParty, checkAutoSelectParty, handleAutoSelectAnyParty, handleAutoSelectParty } from "utils/sop-task"

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
  },
  {
    name: 'anyParty',
    i18nContext: 'SopTask',
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
    handle: handleAutoSelectAnyParty('booking'),
    check: checkAutoSelectAnyParty('booking')
  },
  {
    name: 'shipper',
    component: {
      is: 'AsyncAutoComplete',
      props: {
        searchTextParams: {
          url: 'api/party/query/party_auto_suggest',
          method: 'POST',
          data: {
            subqueries: {
              partyType: {
                value: 'shipper'
              },
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
    handle: handleAutoSelectParty('booking'),
    check: checkAutoSelectParty('booking')
  },
  {
    name: 'consignee',
    component: {
      is: 'AsyncAutoComplete',
      props: {
        searchTextParams: {
          url: 'api/party/query/party_auto_suggest',
          method: 'POST',
          data: {
            subqueries: {
              partyType: {
                value: 'consignee'
              },
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
    handle: handleAutoSelectParty('booking'),
    check: checkAutoSelectParty('booking')
  },
  {
    name: 'carrierCode',
    i18nContext: 'SopTask',
    component: {
      is: 'AsyncAutoComplete',
      props: {
        searchTextParams: {
          method: 'POST',
          url: 'api/code/query/code_master',
          data: {
            subqueries: {
              codeType: {
                value: 'CARRIER'
              },
              q: {
                value: '{{context.search}}'
              }
            },
            limit: 5
          }
        },
        'item-text': 'name',
        'item-value': 'code',
        'return-object': true
      }
    }
  }
]