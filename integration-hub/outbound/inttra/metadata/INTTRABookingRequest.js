module.exports = {
    message: {
        header: {
            SenderId: `{{userId}}`,
            ReceiverId: "INTTRA",
            RequestDateTimeStamp: `{{createdAt}}`,
            RequestMessageVersion: "1.0",
            TransactionType: "Booking",
            TransactionVersion: "2.0",
            TransactionStatus: "Original"
        },
        MessageBody: {
            MessageProperties: {
                ShipmentID: "",
                ContactInformation: {
                    Type: "InformationContact",
                    Name: `{{createdBy}}`,
                    CommunicationDetails: {
                        Email: `{{createdBy}}`
                    }
                },
                DateTime: {
                    "@Type": "Date",
                    "#": `{{createdAt}}`
                },
                MovementType: "PortToPort",
                PerContainerReleaseNbrReqst: "true",  // Only applicable when TransactionStatus = ‘Original’
                Location: [
                    {
                        Type: "PlaceOfDelivery",
                        Identifier: {
                            "@Type": "UNLOC",
                            "#": `{{placeOfDelivery}}`
                        },
                        DateTime: {
                            "@DateType": "EstimatedArrival",
                            "@Type": "DateTime",
                            "#": `{{estimatedArrivalDate}}`
                        }
                    },
                    {
                        Type: "PlaceOfReceipt",
                        Identifier: {
                            "@Type": "UNLOC",
                            "#": `{{placeOfReceipt}}`
                        },
                        DateTime: {
                            "@DateType": "EarliestDeparture",
                            "@Type": "DateTime",
                            "#": `{{estimatedDepartureDate}}`
                        }
                    }
                ],
                Party: {
                    Role: `{{roleCode}}`,
                    Address: {
                        StreetAddress: `{{address1}}`,
                        CityName: `{{address2}}`,
                        CountryName: `{{address3}}`
                    },
                    Contacts: {
                        Type: "InformationContact",
                        Name: `{{contact}}`,
                        CommunicationDetails: {
                            Email: `{{email}}`
                        }
                    }
                }
            },
            MessageDetails: {
                GoodsDetails: {
                    LineNumber: "1",
                    GoodDescription: `{{commodity}}`
                },
                EquipmentDetails: {
                    "@FullEmptyIndicator": "Empty",
                    "@EquipmentSupplier": "CarrierSupplied",
                    EquipmentIdentifier: {
                        "@EquipmentIdentifierType": "LogicalContainerNumber",
                        "#": ""
                    },
                    EquipmentType: {
                        EquipmentTypeCode: `{{containerType}}`,
                        EquipmentDescription: ""
                    },
                    NumberOfEquipment: `{{quantity}}`,
                    ImportExportHaulage: {
                        CargoMovementType: `{{service}}`,
                        HaulageArrangements: ""
                    }
                }
            }
        }
    }
}