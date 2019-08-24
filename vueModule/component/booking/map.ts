export default {
  components: [
    {
      is: 'DynamicComponent',
      props: {
        class: 'xs-12 grid align-item-center full-width',
        style: {
          "position": 'absolute',
          "top": '8px',
          "left": '8px',
          'z-index': '999',
          'background-color': '#fff',
          "width": '700px',
          'border-radius': '4px',
        },
        components: [
          {
            is: 'v-btn',
            props: {
              flat: true,
              icon: true,
              small: true,
            },
            events: {
              'click.stop': [
                {
                  type: 'dispatch',
                  otherParams: {
                    name: 'widget/changeMode',
                    mode: 'detail',
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
              i18nKey: 'BookingPage.title',
              swig: true,
            },
          },
        ],
      },
    },
    {
      is: 'Map',
      slots: [
        {
          is: 'Route',
          props: {
            startPoint: 'widget.data.portOfLoadingCode',
            endPoint: 'widget.data.portOfDischargeCode',
            estimatedStartTime: 'widget.data.departureDateEstimated',
            actualStartTime: 'widget.data.departureDateActual',
            estimatedEndTime: 'widget.data.arrivalDateEstimated',
            actualEndTime: 'widget.data.arrivalDateActual',
            mode: 'widget.data.moduleTypeCode',
          },
        },
      ],
    },
  ],
}
