export default {
  class: 'grid',
  components: [
    {
      is: 'DynamicComponent',
      props: {
        class: 'xs-12 grid align-item-center full-width',
        components: [
          {
            is: 'v-btn',
            props: { flat: true, icon: true },
            slots: [{ is: 'Icon', props: { icon: 'arrow_back' } }],
            events: {
              'click.stop': [
                {
                  type: 'dispatch',
                  otherParams: { name: 'widget/changeMode', mode: 'detail' },
                },
              ],
            },
          },
          {
            is: 'I18nText',
            props: {
              class: 'headline',
              i18nKey: 'BookingPage.updateTitle',
              swig: true,
            },
          },
        ],
      },
    },
    {
      is: 'WidgetPanelStepper',
      props: {
        topClick: true,
        validateBeforeStepChange: false,
        preview: 'booking-preview',
        steps: [
          {
            id: 'BookingPage.GeneralForm',
            layout: 'v-card',
            class: 'margin-4 full-width',
            components: [
              {
                is: 'AsyncComponent',
                props: {
                  layoutName: 'booking/forms/generalForm',
                },
              },
            ],
          },
          {
            id: 'BookingPage.PartyForm',
            components: [
              {
                is: 'AsyncComponent',
                props: {
                  layoutName: 'booking/forms/partyForm',
                },
              },
            ],
          },
          {
            id: 'BookingPage.DateForm',
            components: [
              {
                is: 'AsyncComponent',
                props: {
                  layoutName: 'booking/forms/dateForm',
                },
              },
            ],
          },
          {
            id: 'BookingPage.ContainerForm',
            components: [
              {
                is: 'AsyncComponent',
                props: {
                  layoutName: 'booking/forms/containerForm',
                },
              },
            ],
          },
          {
            id: 'BookingPage.referenceForm',
            components: [
              {
                is: 'AsyncComponent',
                props: {
                  layoutName: 'booking/forms/referenceForm',
                },
              },
            ],
          },
        ],
      },
    },
  ],
}
