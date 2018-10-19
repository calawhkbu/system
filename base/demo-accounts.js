module.exports = {
  paths: [
		{
			pathRegExp: /reports\//,
			method: "GET",
			handler: obfuscate,
			parameters: [
				{
					fieldNames: ["officeParty", "primaryText", "secondaryText", "customerName"],
					fromStrings: ["AIR SEA WORLDWIDE", "ASW"],
					toString: "SWIVEL"
				},
				{
					fieldNames: ["officeParty", "primaryText", "secondaryText", "customerName"],
					fromStrings: ["IFB"],
					toString: "FW Intl"
				}
			]
		},
		{
			pathRegExp: /workflow\/transactionCountsForRole\//,
			method: "GET",
			handler: obfuscate,
			parameters: [
				{
					fieldNames: ["name"],
					fromStrings: ["AIR SEA WORLDWIDE", "ASW"],
					toString: "SWIVEL"
				},
				{
					fieldNames: ["name"],
					fromStrings: ["IFB"],
					toString: "FW Intl"
				}
			]
		},
		{
			pathRegExp: /api\/customer\//,
			method: "GET",
			handler: obfuscate,
			parameters: [
				{
					fieldNames: ["logoURL"],
					toString: ""
				},
				{
					fieldNames: ["partyName", "customerName"],
					fromStrings: ["AIR SEA WORLDWIDE", "ASW"],
					toString: "SWIVEL"
				},
				{
					fieldNames: ["partyName", "customerName"],
					fromStrings: ["IFB"],
					toString: "FW Intl"
				}
			]
		}
  ],
  demoUsers: [
  	"swivel360@swivelsoftware.com"
  ]
}

function obfuscate(data, params) {
	data = JSON.parse(JSON.stringify(data));
	utils.objectWalker(data, function(obj) {
		if(typeof obj === 'object') {
			for(var key in obj) {
				if(typeof obj[key] === 'string') {
					params.forEach(param => {
						if(param.fromStrings) {
							param.fromStrings.forEach(item => {
								obj[key] = obj[key].replace(item, param.toString);
							})
						} else {
							obj[key] = param.toString;
						}
					});
				}
			}
		}
	})
	return data;
}
