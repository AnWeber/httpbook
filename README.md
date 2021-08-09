<p align="center">
<img src="https://raw.githubusercontent.com/AnWeber/httpbook/main/icon.png" alt="HttpYac Logo" />
</p>

# Httpbook - Rest Client


> httpBook extension (opens new window)provides a Notebook Editor Interface for Http Requests. Send REST, SOAP, and GraphQL requests directly in Notebook Editor. Notebooks allows you to create and share documents that contain live code, equations, visualizations and narrative text.

<p align="center">
<a href="https://httpyac.github.io/">
<img src="https://httpyac.github.io/httpyac_site.png" alt="HttpYac" />
</a>
<img src="https://raw.githubusercontent.com/AnWeber/httpbook/main/images/httpbin.gif" alt="HttpYac Extension" />
</p>

## Example

```html
@user = doe
@password = 12345678

GET https://httpbin.org/basic-auth/{{user}}/{{password}}
Authorization: Basic {{user}} {{password}}
```

more [examples](https://httpyac.github.io/guide/examples) and [guide](https://httpyac.github.io/guide/)

## Configuration

httpbook uses [vscode-httpyac](https://marketplace.visualstudio.com/items?itemName=anweber.vscode-httpyac) as extension dependency and reuses all of the settings.

## License
[MIT License](LICENSE)

## Change Log
See CHANGELOG [here](CHANGELOG.md)
