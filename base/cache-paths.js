// All expiry in MINUTES
module.exports = {
	refreshPaths: [
		"/reports"
	],
	
	paths: [
		{
			pathRegExp: /reports\/uber[A-Za-z0-9\/\#\{\}\"\:\-\[\]\=,\&\%\?\ ]*groupBy/,
			method: "GET",
			expiryMinutes: 60
		},
		{
			path: "/reports/uber",
			method: "POST",
			bodyRegExp: /groupBy/,
			expiryMinutes: 60
		},
		{
			path: "/reports/tag",
			method: "GET",
			expiryMinutes: 1440
		},
		{
			path: "/reports/uber-summary",
			method: "GET",
			expiryMinutes: 60
		},
		{
			path: "/reports/top-x",
			method: "GET",
			expiryMinutes: 60
		},
		{
			path: "/reports/yoy-by-month",
			method: "GET",
			expiryMinutes: 60
		},
		{
			path: "/reports/shipment-status",
			method: "GET",
			expiryMinutes: 60
		}
	]
};
	

