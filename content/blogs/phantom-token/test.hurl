POST http://localhost:7891/auth/user
{ "name": "pina" }
HTTP 201
[Captures]
session_token: jsonpath "$['token']"

GET http://localhost:7891/api/me
authorization: Bearer {{session_token}}
HTTP 200
[Asserts]
jsonpath "$['sub']" == "pina"
jsonpath "$['iss']" == "keibi-blog"