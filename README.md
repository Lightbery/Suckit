# Suckit
Socket but worse.

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

client.listen('connect', () => {
  console.log(client.sendRequest('ping'))
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
