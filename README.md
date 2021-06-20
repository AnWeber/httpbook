<p align="center">
<img src="https://raw.githubusercontent.com/AnWeber/httpbook/main/icon.png" alt="HttpYac Logo" />
</p>

# Httpbook - Rest Client

Quickly and easily send REST, SOAP, and GraphQL requests directly in Editor

> httpbook uses [vscode-httpyac](https://marketplace.visualstudio.com/items?itemName=anweber.vscode-httpyac) as dependency.

![example](https://raw.githubusercontent.com/AnWeber/httpbook/main/images/httpbin.gif)

> [httpbin.http](https://github.com/AnWeber/httpyac/blob/main/examples/api/httpbin.http)


## Examples

```html
@user = doe
@password = 12345678

GET https://httpbin.org/basic-auth/{{user}}/{{password}}
Authorization: Basic {{user}} {{password}}
```

```html
@host=https://api.spacexdata.com/v4

###

GET /launches/latest

GET /capsules
```

> [more examples](https://github.com/AnWeber/httpyac/tree/main/examples)

A complete specification / documentation can be found [here](https://github.com/AnWeber/httpyac/tree/main/examples/README.md)


## Features

| Feature | httpYac | [Postman](https://www.postman.com/) | [Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) | [Intellij Idea](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) |
| - | :-: | :-: | :-: | :-: |
| Send Request and View | ✓ | ✓ | ✓ | ✓ |
| Variable support | ✓ | ✓ | ✓ | ✓ |
| [Custom Scripting support](https://github.com/AnWeber/httpyac/blob/main/examples/script/preRequestScript.http) | ✓ | ✓ | - ([pull request](https://github.com/Huachao/vscode-restclient/pull/674)) | partially |
| [Test/ Assert Response](https://github.com/AnWeber/httpyac/blob/main/examples/script/chai.http) | ✓ | ✓ | - ([pull request](https://github.com/Huachao/vscode-restclient/pull/773)) | ✓ |
| Authorization support | ✓ | ✓ | partially (no custom auth flow) | - |
| -- [OAuth2 / Open Id Connect](https://github.com/AnWeber/httpyac/blob/main/examples/auth/oauth2.http) | ✓ | ✓ | - | - |
| -- [AWS Signature v4](https://github.com/AnWeber/httpyac/blob/main/examples/auth/aws.http) | ✓ | ✓ | ✓ | - |
| -- [Basic Authentication](https://github.com/AnWeber/httpyac/blob/main/examples/auth/basicAuth.http) | ✓ | ✓ | ✓ | ✓ |
| -- [Digest Authentication](https://github.com/AnWeber/httpyac/blob/main/examples/auth/digest.http) | ✓ | ✓ | ✓ | ✓ |
| -- [SSL Client Certificate](https://github.com/AnWeber/httpyac/blob/main/examples/auth/clientCertifcate.http) | ✓ | ✓ | ✓ | - |
| -- [Custom Authentication](https://github.com/AnWeber/httpyac/blob/main/examples/auth/custom.http) | ✓ | ✓ | - | - |
| Code Generation | ✓ | ✓ | ✓ | - |
| Built-in Preview Support (Image, PDF, ...) | ✓ | - | ✓ (only Image) | - |
| Share workspace | ✓ | paywall | ✓ | ✓ |
| extensible/ plugin support | ✓ | partially | - | - |
| [cli support]((https://www.npmjs.com/package/httpyac)) | ✓ | ✓ | - | - |


## Next Steps

* fix out more little accidents and just test it

## License
[MIT License](LICENSE)

## Change Log
See CHANGELOG [here](CHANGELOG.md)
