module.exports = {
	"should": [
		{"match": {"entity.masterNo": {"query": "$eString", "boost": 2}} }
	]
}
