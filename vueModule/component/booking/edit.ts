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
        steps: [
          {
            id: 'BookingForm.GeneralForm',
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
            id: 'BookingForm.PartyForm',
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
            id: 'BookingForm.DateForm',
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
            id: 'BookingForm.ContainerForm',
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
            id: 'BookingForm.referenceForm',
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
