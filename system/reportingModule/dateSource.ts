export const dateSourceList=  {
    display: "dateSource",
    name: "dateSource",
    props: {
      items: [
        {
          label: "departureDateEstimated",
          value: "departureDateEstimated"
        },
        {
          label: "arrivalDateEstimated",
          value: "arrivalDateEstimated"
        },
        {
          label: "createdAt",
          value: "createdAt"
        }
  
      ],
      multi: false,
      required: true,
    },
    type: 'list'
  }
  //base file and list for dateSourceList, implementation 
//in swivel-backend-new/src/utils/jql-subqueries.ts
