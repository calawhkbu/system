export default [
  {
    name: '850',
    active: true,
    schedule: '0 * * ? * *',
    // very important !!!!!! must use absolute path and end with slash
    searchPath: '/',
    searchExtensions: ['edi', 'txt'],
    storageConfig: {
      handlerName: 'sftp',
      config: {
        os: 'window',

        host: '18.162.98.163',
        port: '990',
        username: '360schedule',
        password: '360Swivel!',

        privateKey: `
-----BEGIN RSA PRIVATE KEY-----
MIIC7AIBAAKBoQC2HmPYZ2HRCe8INqR76EelrYlT52lGkCDlg7GsltZYRuXn1e3f
bG0Ae8YSX/iz7wNJjifmN6Oz4CCc6wKXp7MhVmV6G2Ac+8rLY1fnKgHc06ZRiA3f
FdK5upZ9MDx5roHQOSIQTeubCE3hG/bd+YyvlzIaeIyiyEqN0cyWHZ0DviDXCoU7
Ufgqu8sLlJPaa68QFBmWYVEj0kM/8pzds3xbAgMBAAECgaEAiKR8nZ3T0pf1dOAq
wZ0iRLjT1NRINN1nEU2iPbBe2pU3Yp8sfvpHPpmfn6HKZJbsjH/Qh/cvKIL9dT8P
DuKQkG7WbKuljZmOKtQ63AK0qw4N3qdwWbmquXiK1q8Pcyp4tBuEb0UrnG+LYgJh
0WX2ssHbRxDzKNMwS6XOGjoFv/CMrPw4TwnVf+zCnP6x1ZXEvdbypmjxAo/hdeRj
NqP8AQJRAOH0ph/Lm7Yi4tZjvI7SWzm+scLedAIkiJ6kGkeUVd58gFcUqg4M5a+9
4wgSJp27JsknpdfGCx+o3GyuqcxVFtXM3n5xWYfMJVxN/RE+lu+BAlEAzlWQ8oF2
oa92KdoiaJuMnO/qlCNJSgT3Ta/DYKzJpMhxOZAPyiZQbeDU34vGBGrGDKp+qQa6
K8bagNGnisCfM7+jubAJ2eac00Glcn2xGdsCUB1VYWunRyOyC7jBYe04qdcpRnKB
5pWQoJvXugGo5CzqBM9JQ3pnejoCcMLPeGvpq/NZTlJgx3jotxT05946/afr3MaV
eIYEnqUJCt1+PqIBAlAbb1EojYJCmVvy0KhGlHgr3dKpA9AY4XQohjhKQG9HU8eK
Sddvn4yOL5jeaG1Z5QCUao8Q1m4mp/ghrL7EOjxw2whgBkIpEPrFNDNVd9T2hQJQ
ZVSgQQF3ZB7ae/ab5I2W8eTMF0N36ilUdCTmjxIHf5kun9VUUjCDBYekF4CpXTSd
2hzPBWkCpgZ72UHm5/Djdldc/g51H5cjkC6GVWyvNHA=
-----END RSA PRIVATE KEY-----
        `,
      },
    },

    // the oubound name after parsing the edi
    outbound: 'someOutbound',
  },
]
