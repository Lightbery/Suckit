import net from 'net'

// Server
class Server {
  private _state: 'idle' | 'started' = 'idle'
  private _port!: number 

  private _server: undefined | net.Server = undefined
  private _callback!: (client: Client) => any

  constructor (callback: (client: Client) => any, port?: number) {
    this._port = port || 3000

    this._callback = callback
  }

  // Start The Server
  public start (): void {
    if (this._state !== 'idle') throw new Error(`Cannot Start The Server (State: ${this._state})`)
  
    this._state = 'started'

    this._server = net.createServer((client) => {
      this._callback(new Client(client))
    })

    this._server.listen(this._port)
  }

  // Stop The Server
  public stop (): void {
    if (this._state !== 'started') throw new Error(`Cannot Stop The Server (State: ${this._state})`)

    this._state = 'idle'

    this._server!.close()
  } 
}

// Client
class Client {
  private _client!: net.Socket

  private _state: 'connected' | 'disconnected' = 'connected'

  private _listeners: { [key: string]: Listener } = {}
  private _requests: { [key: string]: (data: any) => any } = {}

  constructor (client: net.Socket) {
    this._client = client

    client.on('close', () => {
      this._state = 'disconnected'

      this._callEvent('disconnect', [])
    })

    let buffer: string = ''

    client.on('data', (chunk) => {
      buffer += chunk.toString()

      while (buffer.includes('|')) {
        const data = JSON.parse(Buffer.from(buffer.substring(0, buffer.indexOf('|')), 'base64').toString()) 

        if (data.type === 'message') this._callEvent('message', [data.data])
        else if (data.type === 'request') this._callEvent('request', [new Request(this, data), data.data])
        else if (data.type === 'response') {
          if (this._requests[data.requestID] !== undefined) {
            this._requests[data.requestID](data.data)

            delete this._requests[data.requestID]
          }
        }

        buffer = buffer.substring(buffer.indexOf('|') + 1, buffer.length)
      }
    })
  }

  public get state () {return this._state}

  // Disconnect The Client
  public disconnect (): void {
  }

  // Send A Data 
  public sendMessage (data: any): void {
    if (this._state !== 'connected') throw new Error(`Cannot Send The Message: (State: ${this._state})`)

    this.sendRawData({ type: 'message', data })
  }

  // Send A Request
  public sendRequest (data: any): Promise<any> {
    if (this._state !== 'connected') throw new Error(`Cannot Send The Request: (State: ${this._state})`)

    return new Promise((resolve) => {
      const id = generateID(5, Object.keys(this._requests))

      this._requests[id] = (response) => resolve(response)

      this.sendRawData({ type: 'request', data, requestID: id })
    })
  }

  // Send Raw Data
  public sendRawData (data: any): void {
    if (this._state !== 'connected') throw new Error(`Cannot Send Data: (State: ${this._state})`)

    this._client?.write(`${Buffer.from(JSON.stringify(data)).toString('base64')}|`)
  }

  // Listen To An Event
  public listen (type: 'disconnect', callback: () => any): string
  public listen (type: 'message', callback: (data: any) => any): string
  public listen (type: 'request', callback: (request: Request, data: any) => any): string
  public listen (type: string, callback: (...args: any) => any): string {
    const id = generateID(5, Object.keys(this._listeners))

    this._listeners[id] = { type, callback }

    return id
  }

  // Remove A Listener
  public removeListener (id: string): void {
    if (this._listeners === undefined) throw new Error(`Listener Not Found: "${id}"`)

    delete this._listeners[id]
  }

  // Remove All Listeners
  public removeAllListeners (): void {
    this._listeners = {}
  }

  // Call An Event
  private _callEvent (type: string, args: any[]): void {
    Object.keys(this._listeners).forEach((id) => {
      if (this._listeners[id].type === type) this._listeners[id].callback(...args)
    })
  }
}

// Request
class Request {
  private _Client!: Client 

  private _responsed: boolean = false

  private _id!: string

  constructor (Client_: Client, data: any) {
    this._Client = Client_

    this._id = data.requestID
  }

  // Response To The Request
  public response (data: any): void {
    if (this._Client.state !== 'connected') throw new Error(`Cannot Response To The Request (State: ${this._Client.state})`)

    if (this._responsed) throw new Error('The Request Has Already Been Responsed')

    this._responsed = true

    this._Client.sendRawData({ type: 'response', data, requestID: this._id })
  }
}

// Listener
interface Listener {
  type: string, 

  callback: (...args: any) => any
}

export { Server, Client }

import generateID from './GenerateID'
