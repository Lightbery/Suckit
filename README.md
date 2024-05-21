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
* `callback <(client: ServerClient) => any>` | The connection callback function.
* `port <number>` | The port of the server. `Default 3000`

## Getters
* `state <string>` | The state of the server.
* `port <number>` | The port of the server.

## start()
```ts
.start() // Start The Server
```
> `return <void>`

## stop()
```ts
.stop() // Stop The Server
```
> `return <void>`

# Client
```ts
import Client from './Suckit-Client'

new Client() // Create A Client
```

## Getters
* `state <string>` | The state of the client.

## connect()
```ts
.connect(<host>, <port>) // Connect To A Server
```
* `host <string>` | The hostname of the server.
* `port <number>` | The port of the server. `Default 3000`

> `return Promise<void>`

## disconnect()
```ts
.disconncet() // Disconnect From The Server
```

> `return <void>`

## sendMessage()
```ts
.sendMessage(data) // Send A Message To The Server
```
* `data <any>` | The content of the message.

> `return <void>`

## sendRequest()
```ts
.sendRequest(<data>) // Send A Request To The Server
```
* `data <any>` | The content of the request.

> `return Promise<any>`

## sendRawData()
```ts
.sendRawData(<data>) // Send Raw Data To The Server
```
* `data <any>` | The data that you wan to send.

> `return <void>`

## listen()
```ts
.listen(<type>, <callback>) // Listen To An Event
```
* `type <string>` | The type of the event.
* `callback <(...args) => any>` | The function that triggers when the event is called.

**- All Events -**
| name       | callback arguments            | description                                           |
| ---        | ---                           | ---                                                   |
| connect    | ()                            | Triggeres when the client connect to the server.      |
| disconnect | ()                            | Triggeres when the client disconnect from the server. |
| message    | (data: any)                   | Triggeres when the client receive a message.          |
| request    | (request: Request, data: any) | Triggeres when the client receive a request.          |

> `return <string>` (The ID of the listener)

## removeListener()
```ts
.removeListener(<id>) // Remove A Listener
```
* `id <string>` | The ID of the listener.

> `return <void>`

## removeAllListeners()
```ts
.removeAllListeners() // Remove All Listeners
```

> `return <void>`
