export default {
  layout: 'MainLayout',
  components: [{
    is: 'Widget',
    props: {
      settingProp: {
        initAxiosParams: {
          url: 'api/booking/{{state.id}}'
        },
        defaultAxiosParams: {
          url: 'default/booking'
        },
        validateAxiosParams: {
          method: 'post',
          url: 'api/booking/validate/{{id}}'
        },
        saveAxiosParams: {
          method: 'post',
          url: 'api/booking'
        },
        primaryKey: '"id"',
        modeFunction: `
          const modes = [
            'assignment', 'quick-create', 'create', 'detail',
            'edit', 'map', // 'import', 'copy'
          ]
          const selectedMode = isNaN(Number(mode)) ? mode : 'detail'
          if (!modes.includes(selectedMode)) {
            throw new Error('Not this mode')
          }
          return selectedMode
        `,
        haveTermOnCreate: true,
        haveTermOnEdit: false,
        widgetComponentSetting: {
          detail: {
            readonly: true
          },
          edit: {
            readonly: false,
            stepper: 0,
            saveIcon: 'save'
          }
        }
      }
    }
  }]
}
