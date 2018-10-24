// All expiry in MINUTES
module.exports = {
	refreshPaths: [
		"/reports"
	],
	
	paths: [
		{
			path: "/reports/uber-division",
			method: ["GET", "POST"],
			expiryMinutes: 1440
		},
		{
			path: "/reports/uber",
			body: "offset",
			method: "POST",
			expiryMinutes: 15
		},
		{
			path: "/reports/uber",
			method: ["GET", "POST"],
			expiryMinutes: 60
		},
		{
			path: "/reports/shipment-status",
			method: ["GET", "POST"],
			expiryMinutes: 15
		},
		{
			path: "/reports/alert-details",
			method: ["GET", "POST"],
			expiryMinutes: 5
		},
		{
			path: "/reports/alerts",
			method: ["GET", "POST"],
			expiryMinutes: 5
		},
		{
			path: "/fm3k/",
			method: "GET",
			expiryMinutes: 60
		}
	]
};
	

