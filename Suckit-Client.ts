import net from 'net'

// Client
class Client {
  private _state: 'idle' | 'connecting' | 'connected' = 'idle'

  private _connection: undefined | net.Socket = undefined

  private _listeners: { [key: string]: Listener } = {}
  private _requests: { [key: string]: (data: any) => any } = {}

  public get state () {return this._state}

  // Connect To A Server
  public connect (host: string, port?: number): Promise<void> {
    if (this._state !== 'idle') throw new Error(`Cannot Connect To A Server (State: ${this._state})`)

    return new Promise((resolve) => {
      this._state = 'connecting'

      this._connection = net.createConnection(port || 3000, host)

      this._connection.once('connect', () => {
        this._state = 'connected'

        this._callEvent('connect', [])

        resolve()
      })

      this._connection.once('close', () => {
        this._state = 'idle'

        this._callEvent('disconnect', [])

        this._connection = undefined
      })

      let chunks: Buffer[] = []

      this._connection.on('data', (chunk) => {
        chunks.push(chunk)

        if (chunk.includes('|')) {
          let buffer = Buffer.concat(chunks)

          while (buffer.includes('|')) {
            if (this._state === 'connected') {
              let data = JSON.parse(Buffer.from(buffer.subarray(0, buffer.indexOf('|') + 1).toString(), 'base64').toString()) 

              if (data.type === 'message') this._callEvent('message', [data.data])
              else if (data.type === 'request') this._callEvent('request', [new Request(this, data), data.data])
              else if (data.type === 'response') {
                if (this._requests[data.requestID] !== undefined) {
                  this._requests[data.requestID](data.data)

                  delete this._requests[data.requestID]
                }
              }
            }

            buffer = buffer.subarray(buffer.indexOf('|') + 1, buffer.length)
          }

          chunks = [buffer]
        } 
      })
    })
  }

  // Disconnect From The Server
  public disconnect (): void {
    if (this._state !== 'connected') throw new Error(`Cannot Disconnect (State: ${this._state})`)

    this._connection?.destroy()
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

    this._connection?.write(`${Buffer.from(JSON.stringify(data)).toString('base64')}|`)
  }

  // Listen To An Event
  public listen (type: 'conncet' | 'disconnect', callback: () => any): string
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

// Generate ID
function generateID (length: number, keys: string[]): string {
  let id = generateAnID(length)

  while (keys.includes(id)) id = generateAnID(length)

  return id
}

// Generate An ID
function generateAnID (length: number): string {
  let string: string = ''

  for (let i = 0; i < length; i++) string += letters[getRandom(0, letters.length - 1)]

  return string
}

// Get A Random Number
function getRandom (min: number, max: number): number {
  return Math.floor(Math.random() * max) + min 
}

// Listener
interface Listener {
  type: string, 

  callback: (...args: any) => any
}

export default Client 

const letters: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789'
