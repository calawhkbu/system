
import { EdiConfig } from 'modules/edi/service'

export default [

    {
        ediType : '850',
        schedule : '0 * * * *',

        // very important !!!!!! must use absolute path and end with slash
        searchPath : '/home/ec2-user/ftptest/',

        // searchPath : 'C:\\home\\ec2-user\\ftptest\\',

        inboundStorage : {

            handlerName : 'sftp',
            config: {

                os : 'linux',

                host: '13.229.70.248',
                port: '22',
                username: 'ec2-user',

                privateKey : `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEArHIaO2kLkKjmLa/p7hBjLYANycRFrg20g3mBJU1UuKORMe/FFE7hKaYVuoq5
85x5/uwBPC2Zxcq58b4vzM9eU0rhCT2CvwBbtnpGhc1jcLymGiyoKsB0sKEem47cP5oGfaWfeg+T
GGMgkTIYRblwi1D/obfJKZUJuBJngZdycRscW8HrSLuvTbmvMjthy+BCNlPckNS+6pgsXgmQWfCY
gLWsuiyADLDBvq1v72qLb2j6TY4d0TW1Sb46Zg+51AuuOngk/c9fITLGqA4sEIp8iY71wOhYe8tP
yI7Ym088ME6UIK6oZfnoNzy5Tc6Rw55PZ92actn7CFeUgvM4u8U4NQIDAQABAoIBAH+CQ0lIrAeE
C+ceWx/vuBXtyMQ3P7qqYZ6Rml/FpW59a5/8BcK1bKJKL2jmqQar3j0TrvobUcfB1eodUeTkNH/s
LyeQ9vtaPXZZRYosS2oR49QYzyQFeIMeL66gXNUeg8wmShyMJZzztyIFY5MywjgRZWPjrHf1vuD/
os9c938PbyViK9uO9XBZlJTnH2ErPI8I0QJaQsrFdtMvaPstXIJJc2g3uDdkX6n1Obo4WrjFX01J
9ChZ3yQUvVkrwMPSKdA3BMYPbyDfbIRIPUSh+wLX0hhPkoBLvgoudoCu1n0MmrRaM3LxET6BWgTC
dGbDvhJU2Wnr0YD10jxiSd9jvgECgYEA6wQgA7UsZ5xRck2oYVIOK3OvLMQN9+4vKGqPlF3AkLo9
VcWZ5kxONgY/TVkpWncF+lwdnnEt5NasSU6ASF/TyFcH7g3I4yIx/4BbStp8nWTh+lPfpcD540Im
B9ZBZHHP7+fZtDZA+zMCMQjcApthIEFufks7wN4fuSbJjvypdbUCgYEAu9fGqpvdgLK/uL72Tocm
tz2DrJZJv4QSU5i/iB6I4OE3mbHnIO7StHhnL0C1prqWfFg8hdmpdIzELoVmbX/YoS7zqWUJ4q/p
PFRZs/AmkL9Ik8a/nziUWlDJQ/texPFzxqqLg2BbyJVMAqfe+vD64AjG1nhoLoctniRDMufuSIEC
gYEAg+WbxhjvI/MyLrFw17XCqBZT8Q7TPBtcMhWkIUOAqHktpS6yUfLvThixfEqXD+OO4lTCdsLU
XAMzTC0XiAboCB74H11zKi5t2xSBp//5Qih1PxXFhfRJCod8apePuby6U81OfHqae6DEERsExx3H
I+A1EAJPNc40BajEJFCfFqUCgYEAnuB/iTfx3nPRkyn5XCwVw/DEmUo4MEM92PUeMrxY25PCGj4N
lp5JGxmndKEPw2iX9a4P6spR+GFDYXG1U7JJgPMcZk8uUEynQj657GaXx9/yPANjegE6ATXJNbW7
z2nFmegPvlvW5c3ZD3n7MFZ4atshiq8mtwvgupxDNiBTO4ECgYBcsrLd0Nxro0P199nQ6FF5u9eo
kXGMTibz+rkuFBiYNjM5wO4HuZbX3tIA9f72AGHv4yE+UZHdkbBQrHgPt/San/X2ReOxCIKiYchO
SpxX060DaRIImkOxr2NrNTcF8ZkpEHiRKeFxB0dQ8hnmqQt6LRj96kEeMnAXVK2rDsoJmg==
-----END RSA PRIVATE KEY-----`
              }

        },

        outbound : 'someOutbound'

    }

] as EdiConfig[]
