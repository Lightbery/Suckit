# Suckit
A thing like socket, but worse.

## Example
```ts
import { Server } from './Suckit-Server'
import Client from './Suckit-Client'

const server = new Server((client) => {
  client.listen('request', (request, data) => {
    console.log(data)

    request.response('pong')
  })
})

const client = new Client()

client.connect('localhost')

client.listen('connect', async () => {
  console.log(await client.sendRequest('ping'))
})
```

> [!Note]
> Suckit need `GenerateID.ts` and `GetRandom.ts` as dependencies.

## Contents
* [Server](#server)
  * [Getters](#getters)
  * [start()](#start)
  * [stop()](#stop)
* [Client](#client)
  * [Getters](#getters-1)
  * [connect()](#connect)
  * [disconnect()](#disconnect)
  * [sendMessage()](#sendmessage)
  * [sendRequest()](#sendrequest)
  * [sendRawData()](#sendrawdata)
  * [listen()](#listen)
  * [removeListener()](#removelistener)
  * [removeAllListeners()](#removealllisteners)

# Server
```ts
import { Server } from './Suckit-Server'

new Server(<callback>, <port>) // Create a server
```
* `callback <function>` | The callback function will receive a callback function will receive the following parameters: `(client: ServerClient)`
* `port <number>` | The port of the server. `Default 3000`

## Getters
* `state <string>` | The state of the server.
* `port <number>` | The port of the server.

## start()
```ts
.start() // Start The Server
```
> `return <undefined>`

## stop()
```ts
.stop() // Stop The Server
```
> `return <undefined>`

# Client
```ts
import Client from './Suckit-Client'

new Client() // Create A Client
```

## connect()
```ts
.connect(host: string, port?: number) // Connect To A Server
```
