export default {
  components: [{
    is: 'WidgetMoreForm',
    props: {
      mainKey: 'Party',
      formProps: {
        z: {
          class: 'xs-12 md-6 padding-4'
        }
      },
      labelProps: {
        z: {
          isComponent: 'v-label',
          i18nContext: 'Widget',
          class: 'font-110'
        },
        shipper: {
          class: 'font-110 teal--text required form-label'
        },
        consignee: {
          class: 'font-110 green--text required form-label'
        },
        forwarder: {
          class: 'font-110 blue--text'
        },
        agent: {
          class: 'font-110 brown--text'
        },
        notifyParty: {
          class: 'font-110 pink--text'
        }
      },
      fixedKeys: [
        'shipper',
        'consignee',
        'forwarder',
        'agent',
        'notifyParty'
      ],
      alwaysShowKeys: [
        'shipper',
        'consignee',
        'forwarder',
        'agent',
        'notifyParty'
      ],
      canAdd: true,
      canAddProps: {
        class: 'xs-12 md-6 padding-20 min-height-200 margin-auto'
      },
      fields: [{
          name: '{{flex}}{{key}}Party',
          component: 'AsyncAutoSuggest',
          class: 'xs-12',
          relation: '{{flex}}{{key}}Party',
          relationMore: [{
              name: '{{flex}}{{key}}PartyId',
              selector: 'id'
            },
            {
              name: '{{flex}}{{key}}PartyName',
              selector: 'name'
            },
            {
              name: '{{flex}}{{key}}PartyPhone',
              selector: 'partyPhone'
            },
            {
              name: '{{flex}}{{key}}PartyFax',
              selector: 'partyFax'
            },
            {
              name: '{{flex}}{{key}}PartyEmail',
              selector: 'partyEmail'
            },
            {
              name: '{{flex}}{{key}}PartyAddress',
              selector: 'partyAddress'
            },
            {
              name: '{{flex}}{{key}}PartyCityCode',
              selector: 'partyCityCode'
            },
            {
              name: '{{flex}}{{key}}PartyStateCode',
              selector: 'partyStateCode'
            },
            {
              name: '{{flex}}{{key}}PartyCountryCode',
              selector: 'partyCountryCode'
            },
            {
              name: '{{flex}}{{key}}PartyZip',
              selector: 'partyZip'
            },
            {
              name: '{{flex}}{{key}}PartyContactPersonId',
              selector: 'contactPersonId'
            },
            {
              name: '{{flex}}{{key}}PartyContactPersonEmail',
              selector: 'contactPersonEmail'
            },
            {
              name: '{{flex}}{{key}}PartyContactPersonName',
              selector: 'contactPersonName'
            },
            {
              name: '{{flex}}{{key}}PartyContactPersonPhone',
              selector: 'contactPersonPhone'
            }
          ],
          props: {
            'showValue': false,
            'canCreate': true,
            'canCreateValue': {
              id: null,
              name: '{{autoSuggestModel}}'
            },
            'searchValueParams': {
              url: 'api/party/{{context.autoSuggestModel}}'
            },
            'searchTextParams': {
              url: 'api/party/query/party_auto_suggest',
              method: 'POST',
              data: {
                subqueries: {
                  q: {
                    value: '{{context.search}}'
                  },
                  partyTypes: {
                    value: ['{{key}}']
                  }
                },
                limit: 5
              }
            },
            'item-text': 'name',
            'item-value': 'id'
          }
        },
        {
          label: 'Widget.contactName',
          name: '{{flex}}{{key}}PartyContactName',
          component: 'v-text-field',
          class: 'xs-12 md-4',
          readonlyClass: 'hidden'
        },
        {
          label: 'Widget.contactEmail',
          name: '{{flex}}{{key}}PartyContactEmail',
          component: 'v-text-field',
          class: 'xs-12 md-4',
          readonlyClass: 'hidden'
        },
        {
          label: 'Widget.contactPhone',
          name: '{{flex}}{{key}}PartyContactPhone',
          component: 'v-text-field',
          class: 'xs-12 md-4',
          readonlyClass: 'hidden'
        },
        {
          name: '{{flex}}{{key}}PartyContacts',
          component: 'TableField',
          class: 'xs-12',
          readonlyClass: 'hidden',
          props: {
            overrideRowIndex: 1,
            fields: [{
                label: 'Widget.contactXName',
                name: 'Name',
                component: 'v-text-field',
                class: 'xs-12 md-4',
                _readonlyClass: 'hidden'
              },
              {
                label: 'Widget.contactXEmail',
                name: 'Email',
                component: 'v-text-field',
                class: 'xs-12 md-4',
                _readonlyClass: 'hidden'
              },
              {
                label: 'Widget.contactXPhone',
                name: 'Phone',
                component: 'v-text-field',
                class: 'xs-12 md-4',
                _readonlyClass: 'hidden'
              }
            ]
          }
        },
        {
          label: 'Widget.address',
          name: '{{flex}}{{key}}PartyAddress',
          component: 'v-textarea',
          props: {
            'auto-grow': true,
            'rows': 5
          },
          class: 'xs-12',
          readonlyClass: 'hidden'
        },
        {
          label: 'Widget.city',
          name: '{{flex}}{{key}}PartyCityCode',
          component: 'AsyncAutoSuggest',
          class: 'xs-12 md-4',
          readonlyClass: 'xs-12 md-4',
          more: [{
            name: '{{key}}PartyCityCode',
            selector: 'code'
          }],
          props: {
            'searchValueParams': {
              url: 'api/location/query/location',
              method: 'POST',
              data: {
                subqueries: {
                  q: {
                    value: '{{context.autoSuggestModel}}'
                  }
                }
              }
            },
            'searchTextParams': {
              url: 'api/location/query/location',
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
            'item-value': 'locationCode'
          }
        },
        {
          label: 'Widget.state',
          name: '{{flex}}{{key}}PartyStateCode',
          component: 'AsyncAutoSuggest',
          class: 'xs-12 md-4',
          readonlyClass: 'xs-12 md-4',
          relation: '{{key}}PartyStateCode',
          relationMore: [{
            name: '{{key}}PartyStateCode',
            selector: 'code'
          }],
          props: {
            'searchValueParams': {
              url: 'api/code/query/code_master',
              method: 'POST',
              data: {
                subqueries: {
                  codeType: {
                    value: 'STATE-PROVINCE'
                  },
                  q: {
                    value: '{{context.autoSuggestModel}}'
                  }
                }
              }
            },
            'searchTextParams': {
              url: 'api/code/query/code_master',
              method: 'POST',
              data: {
                subqueries: {
                  codeType: {
                    value: 'STATE-PROVINCE'
                  },
                  q: {
                    value: '{{context.search}}'
                  }
                },
                limit: 5
              }
            },
            'item-text': 'name',
            'item-value': 'code'
          }
        },
        {
          label: 'Widget.country',
          name: '{{flex}}{{key}}PartyCountryCode',
          component: 'AsyncAutoSuggest',
          class: 'xs-12 md-4',
          readonlyClass: 'xs-12 md-4',
          more: [{
            name: '{{key}}PartyCountryCode',
            selector: 'code'
          }],
          props: {
            'searchValueParams': {
              url: 'api/code/query/code_master',
              method: 'POST',
              data: {
                subqueries: {
                  codeType: {
                    value: 'COUNTRY'
                  },
                  q: {
                    value: '{{context.autoSuggestModel}}'
                  }
                }
              }
            },
            'searchTextParams': {
              url: 'api/code/query/code_master',
              method: 'POST',
              data: {
                subqueries: {
                  codeType: {
                    value: 'COUNTRY'
                  },
                  q: {
                    value: '{{context.search}}'
                  }
                },
                limit: 5
              }
            },
            'item-text': 'name',
            'item-value': 'code'
          }
        },
        {
          label: 'Widget.zip',
          name: '{{flex}}{{key}}PartyZip',
          component: 'v-text-field',
          class: 'xs-12 md-6',
          readonlyClass: 'hidden'
        }
      ]
    }
  }]
}
