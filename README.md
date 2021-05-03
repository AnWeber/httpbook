<p align="center">
<img src="https://raw.githubusercontent.com/AnWeber/httpbook/main/icon.png" alt="HttpYac Logo" />
</p>

# Httpbook - Rest Client

Quickly and easily send REST, SOAP, and GraphQL requests directly in Editor

![example](https://raw.githubusercontent.com/AnWeber/httpbook/main/examples/oauth2.gif)


## Examples

```html
@user = doe
@password = 12345678

GET https://httpbin.org/basic-auth/{{user}}/{{password}}
Authorization: Basic {{user}} {{password}}
```

```html
POST https://api.github.com/graphql
Content-Type: application/json
Authorization: Bearer {{git_api_key}}

query test($name: String!, $owner: String!) {
  repository(name: $name, owner: $owner) {
    name
    fullName: nameWithOwner
    forkCount
    watchers {
        totalCount
    }
  }
}

{
    "name": "vscode-httpyac",
    "owner": "AnWeber"
}
```

> [more examples and specification](https://github.com/AnWeber/httpyac/tree/main/examples)

A complete specification / documentation can be found [here](https://github.com/AnWeber/httpyac/tree/main/examples/README.md)

## Features

### send

Create and execute any REST, SOAP, and GraphQL queries from within VS Code Notebook editor and view response in output cells.


### Manage Authentication

There are many authentications already built in
* [OAuth2 / Open Id Connect](https://github.com/AnWeber/httpyac/blob/main/examples/auth/oauth2.http)
* [Basic](https://github.com/AnWeber/httpyac/blob/main/examples/auth/basicAuth.http)
* [Digest](https://github.com/AnWeber/httpyac/blob/main/examples/auth/digest.http)
* [AWS](https://github.com/AnWeber/httpyac/blob/main/examples/auth/aws.http)
* [SSL Client Certificate](https://github.com/AnWeber/httpyac/blob/main/examples/auth/clientCertifcate.http)
* [Custom Authentication](https://github.com/AnWeber/httpyac/blob/main/examples/auth/custom.http) support with NodeJS Scripts


### Variables

Built in support for variables and enviroments.
  * [dotenv](https://www.npmjs.com/package/dotenv) support
  * [intellij variable support](https://www.jetbrains.com/help/idea/exploring-http-syntax.html#environment-variables)
  * provide custom variables with scripts

> see [gif](https://raw.githubusercontent.com/AnWeber/vscode-httpyac/master/examples/variables.gif)

### Node JS Scripting Support

enrich requests with custom scripts
  * add [Custom Authentication](https://github.com/AnWeber/httpyac/blob/main/examples/script/preRequestScript.http) to the requests
  * Node JS scripting support (pre request and post request)

> see [gif](https://raw.githubusercontent.com/AnWeber/vscode-httpyac/master/examples/scripting.gif)



### Intellij HTTP Client compatibility

*.http files of [Intellij HTTP Client](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) can be parsed and executed

### CLI support

Check the returns of the responses and execute them automatically using the [httpyac cli](https://www.npmjs.com/package/httpyac) in your ci environment


### It's Extensible

Provide custom notebook renderer, but api is not stable at the moment

## Feature comparisons

| Feature | httpYac | [Postman](https://www.postman.com/) | [Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) | [Intellij Idea](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) |
| - | :-: | :-: | :-: | :-: |
| Send Request and View | ✓ | ✓ | ✓ | ✓ |
| Variable support | ✓ | ✓ | ✓ | ✓ |
| Custom Scripting support | ✓ | ✓ | - ([pull request](https://github.com/Huachao/vscode-restclient/pull/674)) | partially |
| Test/ Assert Response | ✓ | ✓ | - ([pull request](https://github.com/Huachao/vscode-restclient/pull/773)) | ✓ |
| Authorization support | ✓ | ✓ | partially (no custom auth flow) | - |
| -- OAuth2/ OpenId Connect | ✓ | ✓ | - | - |
| -- AWS Signnature v4 | ✓ | ✓ | ✓ | - |
| -- Basic Authentication | ✓ | ✓ | ✓ | ✓ |
| -- Digest Authentication | ✓ | ✓ | ✓ | ✓ |
| -- SSL Client Certificate | ✓ | ✓ | ✓ | - |
| -- Custom Authentication | ✓ | ✓ | - | - |
| Code Generation | ✓ | ✓ | ✓ | - |
| Built-in Preview Support (Image, PDF, ...) | ✓ | - | ✓ (only Image) | - |
| Share workspace | ✓ | paywall | ✓ | ✓ |
| extensible/ plugin support | ✓ | partially | - | - |
| cli support | ✓ | ✓ | - | - |


## Next Steps

* evaluate notebook api
* custom renderer implementation
* renderer api support
* better env visualization
* fix out of sync global scripts and more little accidents

## License
[MIT License](LICENSE)

## Change Log
See CHANGELOG [here](CHANGELOG.md)
