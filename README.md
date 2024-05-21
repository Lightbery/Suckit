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
