export default {
  class: 'grid',
  components: [
    {
      is: 'DynamicComponent',
      props: {
        class: 'flex align-item-center full-width',
        components: [
          {
            is: 'v-btn',
            props: {
              flat: true,
              icon: true,
            },
            events: {
              'click.stop': [
                {
                  type: 'router',
                  otherParams: {
                    func: 'push',
                    path: '/bookings',
                  },
                },
              ],
            },
            slots: [
              {
                is: 'Icon',
                props: {
                  icon: 'arrow_back',
                },
              },
            ],
          },
          {
            is: 'I18nText',
            props: {
              class: 'headline',
              i18nContext: 'BookingPage',
              i18nKey: 'quickCreate',
            },
          },
        ],
      },
    },
    {
      is: 'WidgetForm',
      props: {
        class: 'full-width padding-leftright-8',
        fields: [
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.moduleType',
            name: 'moduleTypeCode',
            component: 'AsyncSelect',
            class: 'xs-12 md-3',
            validator: ['required'],
            relation: 'moduleType',
            props: {
              "required": true,
              "axiosParams": {
                url: 'api/code/query/code_master',
                method: 'POST',
                data: {
                  subqueries: {
                    codeType: {
                      value: 'MODULE',
                    },
                  },
                },
              },
              'item-text': 'name',
              'item-value': 'code',
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.boundType',
            name: 'boundTypeCode',
            component: 'AsyncSelect',
            class: 'xs-12 md-3',
            relation: 'boundType',
            validator: ['required'],
            props: {
              "required": true,
              "axiosParams": {
                url: 'api/code/query/code_master',
                method: 'POST',
                data: {
                  subqueries: {
                    codeType: {
                      value: 'BOUND',
                    },
                  },
                },
              },
              'item-text': 'name',
              'item-value': 'code',
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.serviceCode',
            name: 'serviceCode',
            component: 'AsyncSelect',
            class: 'xs-12 md-3',
            validator: ['required'],
            props: {
              "required": true,
              "axiosParams": {
                url: 'api/code/query/code_master',
                method: 'POST',
                data: {
                  subqueries: {
                    codeType: {
                      value: 'SERVTYPE',
                    },
                  },
                },
              },
              'item-text': 'name',
              'item-value': 'code',
              "showValue": false,
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.vas',
            name: 'vas',
            component: 'AsyncSelect',
            class: 'xs-12 md-3',
            props: {
              "multiple": true,
              "axiosParams": {
                url: 'api/code/query/code_master',
                method: 'POST',
                data: {
                  subqueries: {
                    codeType: {
                      value: 'VAS',
                    },
                  },
                },
              },
              'item-text': 'name',
              'item-value': 'code',
              "showValue": false,
              "showSpacer": false,
              "selectedProps": {
                class: 'multiple',
              },
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.placeOfReceipt',
            name: 'placeOfReceipt',
            component: 'AsyncAutoSuggest',
            class: 'xs-12 md-3',
            more: [
              {
                name: 'placeOfReceiptCode',
                selector: 'portCode',
              },
            ],
            props: {
              "searchValueParams": {
                method: 'POST',
                url: 'api/location/query/location',
                data: {
                  subqueries: {
                    moduleType: {
                      value: '{{context.form.moduleTypeCode}}',
                    },
                    ports: {
                      value: '{{context.autoSuggestModel}}',
                    },
                  },
                },
              },
              "searchTextParams": {
                method: 'POST',
                url: 'api/location/query/location',
                data: {
                  subqueries: {
                    moduleType: {
                      value: '{{context.form.moduleTypeCode}}',
                    },
                    q: {
                      value: '{{context.search}}',
                    },
                  },
                  limit: 5,
                },
              },
              'item-text': 'name',
              'item-value': 'portCode',
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.portOfLoading',
            name: 'portOfLoading',
            component: 'AsyncAutoSuggest',
            class: 'xs-12 md-3',
            validator: ['required'],
            more: [
              {
                name: 'portOfLoadingCode',
                selector: 'portCode',
              },
            ],
            props: {
              "required": true,
              "searchValueParams": {
                method: 'POST',
                url: 'api/location/query/location',
                data: {
                  subqueries: {
                    moduleType: {
                      value: '{{context.form.moduleTypeCode}}',
                    },
                    ports: {
                      value: '{{context.autoSuggestModel}}',
                    },
                  },
                },
              },
              "searchTextParams": {
                method: 'POST',
                url: 'api/location/query/location',
                data: {
                  subqueries: {
                    moduleType: {
                      value: '{{context.form.moduleTypeCode}}',
                    },
                    q: {
                      value: '{{context.search}}',
                    },
                  },
                  limit: 5,
                },
              },
              'item-text': 'name',
              'item-value': 'portCode',
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.portOfDischarge',
            name: 'portOfDischarge',
            component: 'AsyncAutoSuggest',
            class: 'xs-12 md-3',
            validator: ['required'],
            more: [
              {
                name: 'portOfDischargeCode',
                selector: 'portCode',
              },
            ],
            props: {
              "required": true,
              "searchValueParams": {
                method: 'POST',
                url: 'api/location/query/location',
                data: {
                  subqueries: {
                    moduleType: {
                      value: '{{context.form.moduleTypeCode}}',
                    },
                    ports: {
                      value: '{{context.autoSuggestModel}}',
                    },
                  },
                },
              },
              "searchTextParams": {
                method: 'POST',
                url: 'api/location/query/location',
                data: {
                  subqueries: {
                    moduleType: {
                      value: '{{context.form.moduleTypeCode}}',
                    },
                    q: {
                      value: '{{context.search}}',
                    },
                  },
                  limit: 5,
                },
              },
              'item-text': 'name',
              'item-value': 'portCode',
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.placeOfDelivery',
            name: 'placeOfDelivery',
            component: 'AsyncAutoSuggest',
            class: 'xs-12 md-3',
            more: [
              {
                name: 'placeOfDeliveryCode',
                selector: 'portCode',
              },
            ],
            props: {
              "searchValueParams": {
                method: 'POST',
                url: 'api/location/query/location',
                data: {
                  subqueries: {
                    moduleType: {
                      value: '{{context.form.moduleTypeCode}}',
                    },
                    ports: {
                      value: '{{context.autoSuggestModel}}',
                    },
                  },
                },
              },
              "searchTextParams": {
                method: 'POST',
                url: 'api/location/query/location',
                data: {
                  subqueries: {
                    moduleType: {
                      value: '{{context.form.moduleTypeCode}}',
                    },
                    q: {
                      value: '{{context.search}}',
                    },
                  },
                  limit: 5,
                },
              },
              'item-text': 'name',
              'item-value': 'portCode',
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.preferredCarrier',
            name: 'carrier',
            component: 'AsyncAutoSuggest',
            class: 'xs-12 md-3',
            relation: 'carrier',
            more: [
              {
                name: 'carrierCode',
                selector: 'code',
              },
            ],
            props: {
              "searchValueParams": {
                method: 'POST',
                url: 'api/code/query/code_master',
                data: {
                  subqueries: {
                    codeType: {
                      value: 'CARRIER',
                    },
                    code: {
                      value: '{{context.autoSuggestModel}}',
                    },
                  },
                },
              },
              "searchTextParams": {
                method: 'POST',
                url: 'api/code/query/code_master',
                data: {
                  subqueries: {
                    codeType: {
                      value: 'CARRIER',
                    },
                    q: {
                      value: '{{context.search}}',
                    },
                  },
                  limit: 5,
                },
              },
              'item-text': 'name',
              'item-value': 'code',
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.poNo',
            name: 'flexData.data.poNo',
            component: 'v-text-field',
            class: 'xs-12 md-3',
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.commodity',
            name: 'commodity',
            component: 'v-text-field',
            class: 'xs-12 md-3',
            validator: ['required'],
            props: {
              required: true,
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.incoTermsCode',
            name: 'incoTerms',
            component: 'AsyncAutoSuggest',
            class: 'xs-12 md-2',
            more: [
              {
                name: 'incoTermsCode',
                selector: 'code',
              },
            ],
            relationMore: [
              {
                name: 'freightTermsCode',
                selector: 'data.frieghtTermsCode',
              },
              {
                name: 'otherTermsCode',
                selector: 'data.otherTermsCode',
              },
            ],
            props: {
              "initList": true,
              "searchTextParams": {
                url: 'api/code/query/code_master',
                method: 'POST',
                data: {
                  fields: ['code_master.*', 'flex_data.data'],
                  subqueries: {
                    codeType: {
                      value: 'INCOTERMS',
                    },
                    q: {
                      value: '{{context.search}}',
                    },
                  },
                },
              },
              'item-text': 'name',
              'item-value': 'code',
              "onInit": true,
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.freightTermsCode',
            name: 'freightTermsCode',
            component: 'AsyncSelect',
            class: 'xs-12 md-1',
            props: {
              "axiosParams": {
                url: 'api/code/query/code_master',
                method: 'POST',
                data: {
                  subqueries: {
                    codeType: {
                      value: 'PAYTERMS',
                    },
                  },
                },
              },
              'item-text': 'code',
              'item-value': 'code',
              "showValue": false,
            },
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.remark',
            name: 'remark',
            component: 'v-textarea',
            class: 'xs-12 md-6',
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            label: 'BookingPage.specialInstruction',
            name: 'flexData.data.specialInstruction',
            component: 'v-textarea',
            class: 'xs-12 md-6',
          },
          {
            containerComponent: 'v-card',
            containerComponentProps: {
              class: 'padding-topbottom-8 padding-leftright-4',
            },
            name: 'Term',
            component: 'Term',
            class: 'xs-12',
            props: {
              type: 'booking-term',
              confirmTermI18nText: 'BookingPage.confirmTerm',
              termProps: {
                class:
                  'margin-leftright-4 padding-leftright-4 min-height-200 max-height-300 overflow-auto',
              },
            },
          },
        ],
      },
    },
    {
      is: 'DynamicComponent',
      props: {
        class: 'flex absolute-bottomright',
        components: [
          {
            is: 'v-spacer',
          },
          {
            is: 'WidgetSave',
            props: {
              fab: true,
              color: 'primary',
            },
          },
        ],
      },
    },
  ],
}
