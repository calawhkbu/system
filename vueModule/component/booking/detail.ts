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
            props: {
              flat: true,
              icon: true,
            },
            slots: [
              {
                is: 'Icon',
                props: {
                  icon: 'arrow_back',
                },
              },
            ],
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
          },
          {
            is: 'I18nText',
            props: {
              class: 'headline',
              i18nKey: 'BookingPage.title',
              swig: true,
            },
          },
          {
            is: 'v-spacer',
          },
          {
            is: 'BookmarkButton',
          },
          {
            is: 'v-btn',
            props: {
              icon: true,
              flat: true,
            },
            slots: [{ is: 'Icon', props: { icon: 'edit' } }],
            events: {
              'click.stop': [
                {
                  type: 'dispatch',
                  otherParams: {
                    name: 'widget/changeMode',
                    mode: 'edit',
                  },
                },
              ],
            },
          },
          {
            is: 'v-btn',
            props: {
              icon: true,
              flat: true,
            },
            slots: [{ is: 'Icon', props: { icon: 'map' } }],
            events: {
              'click.stop': [
                {
                  type: 'dispatch',
                  otherParams: {
                    name: 'widget/changeMode',
                    mode: 'map',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      is: 'div',
      props: {
        class: 'xs-12 md-8 padding-left-8 padding-right-8',
      },
      slots: [
        {
          is: 'DynamicComponent',
          props: {
            layout: 'v-card',
            class: 'margin-topbottom-8',
            components: [
              {
                is: 'MouseHidden',
                slots: [
                  {
                    name: 'hidden',
                    is: 'DynamicComponent',
                    props: {
                      class: 'flex max-height-0',
                      components: [
                        {
                          is: 'v-spacer',
                        },
                        {
                          is: 'v-btn',
                          props: {
                            icon: true,
                            flat: true,
                            small: true,
                            class: 'no-margin zindex-10',
                          },
                          slots: [{ is: 'Icon', props: { small: true, icon: 'edit' } }],
                          events: {
                            'click.stop': [
                              {
                                type: 'dispatch',
                                otherParams: {
                                  name: 'widget/changeMode',
                                  mode: 'edit',
                                },
                                afterActions: [
                                  {
                                    type: 'dispatch',
                                    otherParams: {
                                      name: 'widget/updateComponentSetting',
                                      value: {
                                        stepper: 0,
                                      },
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    is: 'AsyncComponent',
                    props: {
                      layoutName: 'booking/forms/generalForm',
                    },
                  },
                ],
              },
            ]
          },
        },
        {
          is: 'DynamicComponent',
          props: {
            class: 'grid margin-topbottom-8',
            components: [
              {
                is: 'div',
                props: {
                  class: 'xs-12 md-6 padding-right-4',
                },
                slots: [
                  {
                    is: 'DynamicComponent',
                    props: {
                      layout: 'v-card',
                      components: [
                        {
                          is: 'MouseHidden',
                          slots: [
                            {
                              name: 'hidden',
                              is: 'DynamicComponent',
                              props: {
                                class: 'flex max-height-0',
                                components: [
                                  {
                                    is: 'v-spacer',
                                  },
                                  {
                                    is: 'v-btn',
                                    props: {
                                      icon: true,
                                      flat: true,
                                      small: true,
                                      class: 'no-margin zindex-10',
                                    },
                                    slots: [{ is: 'Icon', props: { small: true, icon: 'edit' } }],
                                    events: {
                                      'click.stop': [
                                        {
                                          type: 'dispatch',
                                          otherParams: {
                                            name: 'widget/changeMode',
                                            mode: 'edit',
                                          },
                                          afterActions: [
                                            {
                                              type: 'dispatch',
                                              otherParams: {
                                                name: 'widget/updateComponentSetting',
                                                value: {
                                                  stepper: 1,
                                                },
                                              },
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              is: 'AsyncComponent',
                              props: {
                                layoutName: 'booking/forms/partyForm',
                              },
                            },
                          ],
                        },
                      ]
                    },
                  },
                ],
              },
              {
                is: 'div',
                props: {
                  class: 'xs-12 md-6 padding-left-4',
                },
                slots: [
                  {
                    is: 'DynamicComponent',
                    props: {
                      layout: 'v-card',
                      components: [
                        {
                          is: 'MouseHidden',
                          slots: [
                            {
                              name: 'hidden',
                              is: 'DynamicComponent',
                              props: {
                                class: 'flex max-height-0',
                                components: [
                                  {
                                    is: 'v-spacer',
                                  },
                                  {
                                    is: 'v-btn',
                                    props: {
                                      icon: true,
                                      flat: true,
                                      small: true,
                                      class: 'no-margin zindex-10',
                                    },
                                    slots: [{ is: 'Icon', props: { small: true, icon: 'edit' } }],
                                    events: {
                                      'click.stop': [
                                        {
                                          type: 'dispatch',
                                          otherParams: {
                                            name: 'widget/changeMode',
                                            mode: 'edit',
                                          },
                                          afterActions: [
                                            {
                                              type: 'dispatch',
                                              otherParams: {
                                                name: 'widget/updateComponentSetting',
                                                value: {
                                                  stepper: 2,
                                                },
                                              },
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              is: 'AsyncComponent',
                              props: {
                                layoutName: 'booking/forms/dateForm',
                              },
                            },
                          ],
                        },
                      ]
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          is: 'DynamicComponent',
          props: {
            layout: 'v-card',
            class: 'margin-topbottom-8',
            components: [
              {
                is: 'MouseHidden',
                slots: [
                  {
                    name: 'hidden',
                    is: 'DynamicComponent',
                    props: {
                      class: 'flex max-height-0',
                      components: [
                        {
                          is: 'v-spacer',
                        },
                        {
                          is: 'v-btn',
                          props: {
                            icon: true,
                            flat: true,
                            small: true,
                            class: 'no-margin zindex-10',
                          },
                          slots: [{ is: 'Icon', props: { small: true, icon: 'edit' } }],
                          events: {
                            'click.stop': [
                              {
                                type: 'dispatch',
                                otherParams: {
                                  name: 'widget/changeMode',
                                  mode: 'edit',
                                },
                                afterActions: [
                                  {
                                    type: 'dispatch',
                                    otherParams: {
                                      name: 'widget/updateComponentSetting',
                                      value: {
                                        stepper: 3,
                                      },
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    is: 'AsyncComponent',
                    props: {
                      layoutName: 'booking/forms/containerForm',
                    },
                  },
                ],
              },
            ]
          },
        },
        {
          is: 'DynamicComponent',
          props: {
            layout: 'v-card',
            class: 'margin-topbottom-8',
            components: [
              {
                is: 'MouseHidden',
                slots: [
                  {
                    name: 'hidden',
                    is: 'DynamicComponent',
                    props: {
                      class: 'flex max-height-0',
                      components: [
                        {
                          is: 'v-spacer',
                        },
                        {
                          is: 'v-btn',
                          props: {
                            icon: true,
                            flat: true,
                            small: true,
                            class: 'no-margin zindex-10',
                          },
                          slots: [{ is: 'Icon', props: { small: true, icon: 'edit' } }],
                          events: {
                            'click.stop': [
                              {
                                type: 'dispatch',
                                otherParams: {
                                  name: 'widget/changeMode',
                                  mode: 'edit',
                                },
                                afterActions: [
                                  {
                                    type: 'dispatch',
                                    otherParams: {
                                      name: 'widget/updateComponentSetting',
                                      value: {
                                        stepper: 4,
                                      },
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    is: 'AsyncComponent',
                    props: {
                      layoutName: 'booking/forms/referenceForm',
                    },
                  },
                ],
              },
            ]
          },
        },
      ],
    },
    {
      is: 'div',
      props: {
        class: 'xs-12 md-4 padding-left-8 padding-right-8',
      },
      slots: [
        {
          is: 'AsyncComponent',
          props: {
            class: 'xs-12 margin-topbottom-4',
            layoutName: 'plugins/tracking',
          },
        },
        {
          is: 'AsyncComponent',
          props: {
            class: 'xs-12 margin-topbottom-4',
            layoutName: 'plugins/workflow',
          },
        },
        {
          is: 'AsyncComponent',
          props: {
            class: 'xs-12 margin-topbottom-4',
            layoutName: 'plugins/alert',
          },
        },
        {
          is: 'AsyncComponent',
          props: {
            class: 'xs-12 margin-topbottom-4',
            layoutName: 'plugins/document',
          },
        },
      ],
    },
  ],
}
