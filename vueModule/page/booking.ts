export default {
  layout: 'MainLayout',
  components: [{
    is: 'Widget',
    props: {
      initUrl: 'api/booking/{{id}}',
      saveUrl: 'api/booking',
      primaryKey: 'id',
      canEdit: [
        'entity',
        'return true'
      ],
      top: {
        assignment: [{
            is: 'v-btn',
            props: {
              flat: true,
              icon: true,
              small: true
            },
            events: {
              'click.stop': [{
                type: 'router',
                otherParams: {
                  func: 'push',
                  path: '/bookings'
                }
              }]
            },
            slots: [{
              is: 'Icon',
              props: {
                icon: 'arrow_back'
              }
            }]
          },
          {
            is: 'I18nText',
            props: {
              class: 'headline',
              i18nKey: 'BookingPage.title',
              swig: true
            }
          },
          {
            is: 'v-spacer'
          },
          {
            is: 'BookmarkButton'
          }
          // },
          // {
          //   'is': 'DispatchButton',
          //   'props': {
          //     'slotProps': `
          //       let icon = 'bookmark_border';
          //       let title = 'AddBookmark';
          //       if (context.$store.state.auth.isLogined) {
          //         const { hotList = [] } = context.$store.state.auth.userProfile;
          //         const bookmarked = hotList.filter((item) => {
          //           return item.entity === context.$route.params.page && item.entityId.toString() === context.$route.params.params
          //         });
          //         icon = bookmarked.length > 0 ? 'bookmark' : 'bookmark_border';
          //         title = bookmarked.length > 0 ? 'RemoveBookmark' : 'AddBookmark';
          //       };
          //       return {
          //         layout: 'Icon',
          //         icon: icon
          //       };
          //     `,
          //     'showFunction': `
          //       return context.$route.params.params !== 'create'
          //     `,
          //     'functions': [
          //
          //     ]
          //   }
          // }
        ],
        edit: 'assignment',
        map: 'assignment',
        create: [{
            is: 'v-btn',
            props: {
              flat: true,
              icon: true,
              small: true
            },
            events: {
              'click.stop': [{
                type: 'router',
                otherParams: {
                  func: 'push',
                  path: '/bookings'
                }
              }]
            },
            slots: [{
              is: 'Icon',
              props: {
                icon: 'arrow_back'
              }
            }]
          },
          {
            is: 'I18nText',
            props: {
              class: 'headline',
              i18nKey: 'BookingPage.createTitle',
              swig: true
            }
          },
          {
            is: 'v-spacer'
          }
        ],
        import: [{
            is: 'v-btn',
            props: {
              flat: true,
              icon: true,
              small: true
            },
            events: {
              'click.stop': [{
                type: 'router',
                otherParams: {
                  func: 'push',
                  path: '/bookings'
                }
              }]
            },
            slots: [{
              is: 'Icon',
              props: {
                icon: 'arrow_back'
              }
            }]
          },
          {
            is: 'I18nText',
            props: {
              class: 'headline',
              i18nKey: 'BookingPage.importTitle',
              swig: true
            }
          },
          {
            is: 'v-spacer'
          }
        ],
        copy: [{
            is: 'v-btn',
            props: {
              flat: true,
              icon: true,
              small: true
            },
            events: {
              'click.stop': [{
                type: 'router',
                otherParams: {
                  func: 'push',
                  path: '/bookings'
                }
              }]
            },
            slots: [{
              is: 'Icon',
              props: {
                icon: 'arrow_back'
              }
            }]
          },
          {
            is: 'I18nText',
            props: {
              class: 'headline',
              i18nKey: 'BookingPage.copyTitle',
              swig: true
            }
          },
          {
            is: 'v-spacer'
          }
        ]
      },
      components: {
        assignment: [{
          is: 'DynamicComponent',
          props: {
            class: 'grid',
            components: [{
                is: 'div',
                props: {
                  class: 'xs-8',
                  style: {
                    'padding-right': '4px'
                  }
                },
                slots: [{
                  is: 'DynamicComponent',
                  props: {
                    class: 'grid',
                    components: [{
                        is: 'DynamicComponent',
                        props: {
                          class: 'xs-12',
                          style: {
                            padding: '4px 0px'
                          },
                          components: [{
                            is: 'AsyncComponent',
                            props: {
                              layoutName: 'booking/generalForm'
                            }
                          }]
                        }
                      },
                      {
                        is: 'DynamicComponent',
                        props: {
                          class: 'xs-12 md-7',
                          style: {
                            padding: '4px 4px 4px 0px'
                          },
                          components: [{
                            is: 'AsyncComponent',
                            props: {
                              layoutName: 'booking/partyForm'
                            }
                          }]
                        }
                      },
                      {
                        is: 'DynamicComponent',
                        props: {
                          class: 'xs-12 md-5',
                          style: {
                            padding: '4px 0px 4px 4px'
                          },
                          components: [{
                            is: 'AsyncComponent',
                            props: {
                              layoutName: 'booking/dateForm'
                            }
                          }]
                        }
                      },
                      {
                        is: 'DynamicComponent',
                        props: {
                          class: 'xs-12',
                          style: {
                            padding: '4px 0px'
                          },
                          components: [{
                            is: 'AsyncComponent',
                            props: {
                              layoutName: 'booking/containerForm'
                            }
                          }]
                        }
                      },
                      {
                        is: 'DynamicComponent',
                        props: {
                          class: 'xs-12',
                          style: {
                            padding: '4px 0px'
                          },
                          components: [{
                            is: 'AsyncComponent',
                            props: {
                              layoutName: 'booking/referenceForm'
                            }
                          }]
                        }
                      }
                    ]
                  }
                }]
              },
              {
                is: 'div',
                props: {
                  class: 'xs-4',
                  style: {
                    'padding-left': '4px'
                  }
                },
                slots: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/tracking'
                  }
                }, {
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/workflow'
                  }
                }, {
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/alert'
                  }
                }, {
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/document'
                  }
                }]
              }
            ]
          }
        }],
        create: [{
          is: 'WidgetPanelStepper',
          props: {
            haveTerms: true,
            steps: [{
                id: 'BookingForm.GeneralForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/generalForm'
                  }
                }]
              },
              {
                id: 'BookingForm.PartyForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/partyForm'
                  }
                }]
              },
              {
                id: 'BookingForm.DateForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/dateForm'
                  }
                }]
              },
              {
                id: 'BookingForm.ContainerForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/containerForm'
                  }
                }]
              },
              {
                id: 'BookingForm.referenceForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/referenceForm'
                  }
                }]
              },
              {
                id: 'BookingForm.Preview',
                components: [{
                  is: 'WidgetPreview',
                  props: {
                    type: 'booking-preview'
                  }
                }]
              },
              {
                id: 'BookingForm.TermAndCondition',
                components: [{
                  is: 'WidgetPreview',
                  props: {
                    type: 'booking-term',
                    isTerm: true,
                    confirmTermI18nText: 'BookingPage.confirmTerm'
                  }
                }]
              }
            ],
            initUrl: 'api/booking/{{id}}',
            saveUrl: 'api/booking',
            primaryKey: 'id'
          }
        }],
        edit: [{
          is: 'WidgetPanelStepper',
          props: {
            steps: [{
                id: 'BookingForm.GeneralForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/generalForm'
                  }
                }]
              },
              {
                id: 'BookingForm.PartyForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/partyForm'
                  }
                }]
              },
              {
                id: 'BookingForm.DateForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/dateForm'
                  }
                }]
              },
              {
                id: 'BookingForm.ContainerForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/containerForm'
                  }
                }]
              },
              {
                id: 'BookingForm.referenceForm',
                components: [{
                  is: 'AsyncComponent',
                  props: {
                    layoutName: 'booking/referenceForm'
                  }
                }]
              }
            ],
            initUrl: 'api/booking/{{id}}',
            saveUrl: 'api/booking',
            primaryKey: 'id'
          }
        }],
        map: [{
          is: 'Map',
          slots: [{
            is: 'Route',
            props: {
              startPoint: 'widget.data.portOfLoadingCode',
              endPoint: 'widget.data.portOfDischargeCode',
              estimatedStartTime: 'widget.data.departureDateEstimated',
              actualStartTime: 'widget.data.departureDateActual',
              estimatedEndTime: 'widget.data.arrivalDateEstimated',
              actualEndTime: 'widget.data.arrivalDateActual',
              mode: 'widget.data.moduleTypeCode'
            }
          }]
        }],
        import: [

        ],
        copy: [

        ]
      }
    }
  }]
}
