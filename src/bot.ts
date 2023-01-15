import 'dotenv/config'

import { DisconnectReason, useMultiFileAuthState } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import { waSocket } from '@/socket'
import { message } from '@/events/message'

async function connectToWhatsApp (): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

  waSocket.start(state)
  const sock = waSocket.getSocket()

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
      // reconnect if not logged out
      if (shouldReconnect) {
        void connectToWhatsApp()
      }
    } else if (connection === 'open') {
      console.log('opened connection')
    }
  })

  process
    .on('unhandledRejection', (reason: Error) => {
      if (reason.message === 'rate-overlimit') {
        void connectToWhatsApp()
      }
    })

  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages?.[0]

    await message(msg)
  })
}

// run in main file
void connectToWhatsApp()
