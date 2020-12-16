import { Schedule } from 'models/main/schedule'

interface RouteList {
  port: string,
  eta: string,
  etd: string
  cyCutOffDate: string
  routeList: RouteList[]
}

interface ImportData {
  carrierCode: string,
  vessel: string,
  voyage: string
  routeList: RouteList[]
}

export function convertImportData(data: ImportData[]): Schedule[]{
  if (data) {
    const finalData = data.reduce((out, importData) => {
      const carrierCode = importData.carrierCode
      const vessel = importData.vessel
      const voyage = importData.voyage
      const routeList = importData.routeList || []
      if (!routeList || routeList.length === 0) {
        return out
      }

      const outputData = routeList.reduce((out, departureRoute, departureIndex) => {
        const portOfLoading = departureRoute.port
        const etd = departureRoute.etd
        let cyCutOffDate = departureRoute.cyCutOffDate
        
        const temp = (departureRoute.routeList || []).reduce((out, arrivalRoute, arrivalIndex) => {
          if (arrivalIndex !== departureRoute.routeList.length - 1) {
            const isTransit = arrivalIndex !== 0
            const arrivalDate = arrivalRoute.eta
            const destinationPort = departureRoute.routeList[arrivalIndex + 1].port
            out.push({
              carrierCode: carrierCode,
              vessel: vessel,
              voyage: voyage,
              portOfLoadingCode: portOfLoading,
              portOfDischargeCode: destinationPort,
              estimatedDepartureDate: etd,
              estimatedArrivalDate: arrivalDate,
              cyCutoffDate: cyCutOffDate,
              isTransit: isTransit
            })
          } 

          return out
        }, [])
        return [
          ... out,
          ... temp
        ]
      }, [])
    
      return [
        ... out,
        ... outputData
      ]
    }, [])

    return finalData as Schedule[]
  }

  return []
}