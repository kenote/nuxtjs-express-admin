
import { Socket, PB, ReflectionObject, Protobuffer, PBSetting } from 'kenote-socket-helper'
import { Setting, Config, Send } from '../types/proto'
import channel from '../types/channel'

export default class Proto {

  public __rstps: channel.Rstps
  public __proto: PBSetting
  private __key: string = 'Slave'

  constructor (setting: Config) {
    this.__rstps = setting.rstps
    this.__proto = setting.proto
  }

  async send (proto: Send.Proto, payload: {} | null | undefined, key?: string | string[]): Promise<PB.Message | undefined> {
    let rstp: Setting.Server = this.getRstp(key || this.__key)
    let { host, port } = rstp
    let socket: Socket = new Socket(host, port)
    let protobuffer: Protobuffer = new Protobuffer(this.__proto)
    let { createPBBuffer, makeData, decode, gameMessage } = protobuffer
    let data: Buffer = makeData(createPBBuffer(<number>proto.code, proto.req, payload || {}))
    let messageQuery: ReflectionObject = <ReflectionObject> gameMessage(proto.res)
    console.log(`[${key || this.__key}] rstp://${host}:${port}\n`)
    console.log(`Payload`, JSON.stringify(payload || {}, null, 2), `\n`)
    try {
      let buffer: Buffer = await socket.send(data)
      let msgBase: PB.Message = <PB.Message> decode(buffer, messageQuery)
      console.log(`Result`, msgBase, `\n`)
      return msgBase
    } catch (error) {
      console.error(error)
    }
  }

  private getRstp (key: string | string[]): Setting.Server {
    let _key: string = Object.keys(this.__rstps).indexOf(<string>key) > -1 ? <string>key : this.__key
    let rstp: Setting.Server
    try {
      rstp = this.__rstps[_key]
    } catch (error) {
      rstp = { host: '127.0.0.1', port: '8080' }
    }
    return rstp
  }
}
