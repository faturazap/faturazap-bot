import makeWASocket, { AuthenticationState } from '@adiwajshing/baileys'

type WASocket = typeof makeWASocket

class Socket {
  private socketServer: ReturnType<WASocket>

  public start (state: AuthenticationState): void {
    this.socketServer = makeWASocket({
      auth: state,
      printQRInTerminal: true
    })
  }

  public getSocket () {
    return this.socketServer
  }
}

export const waSocket = new Socket()
