# hapi-compat

This plugin tries to detect, warn and auto-fix Hapi 17 breaking changes which are not fixed in plugins with a best effort.
Hooks are recursive so if a plugin requires incompatible plugins, compat plugin will support them too.

<p align="center">
<img src="https://user-images.githubusercontent.com/5158436/31843485-1db22afc-b600-11e7-89ef-3fc0c3efcdc3.png" width="500px">
</p>

## Supported Breaking Changes

ID                |  Option     | Auto Fix | Description
------------------|-------------|----------|-----------------------------------------------------------------------
ASYNC_PLUGINS     | `register`  | YES      | plugins with next callback should return a Promise now
SERVER_REGISTER   | `register`  | YES      | `server.register({ register })` should be `{ plugin }`
SERVER_ON         | `events`    | YES      | `server.on` ~> `server.events.on`
ASYNC_SERVER_EXT  | `ext`       | YES      | Support for server.ext where the method expects having `next` callback

For a detailed look at breaking changes please see [here](https://github.com/hapijs/hapi/milestone/221?closed=1)

## Setup

Install package:

```bash
npm install hapi-compat

# or using yarn...

yarn add hapi-compat
```

Add plugin and push main Hapi instance as `options.server` to allow globally registering hooks:

```js
// ...
const server = new Hapi.Server(....)

// ...
server.register({
    plugin: 'hapi-compat',
    options: {
        server,
        // ext: false,
        // events: false,
    }
})
```

# License 

MIT - [https://github.com/bakjs/bak](BAK)