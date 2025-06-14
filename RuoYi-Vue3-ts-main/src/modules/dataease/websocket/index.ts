import SockJS from 'sockjs-client/dist/sockjs.min.js'
import Stomp from 'stompjs'
import { useCache } from '@de/hooks/web/useCache'
import { useEmitt } from '@de/hooks/web/useEmitt'
const { wsCache } = useCache()
let stompClient: Stomp.Client
let timeInterval
const env = import.meta.env
const basePath = env.VITE_APP_WEBSOCKET_API

export default {
  install() {
    const channels = [
      {
        topic: '/task-export-topic',
        event: 'task-export-topic-call'
      },
      {
        topic: '/report-notice',
        event: 'report-notice-call'
      }
    ]
    function isLoginStatus() {
      if (wsCache.get('app.desktop')) {
        return true
      }
      return wsCache.get('user.token') && wsCache.get('user.uid')
    }

    function connection() {
      if (!isLoginStatus()) {
        return
      }
      if (stompClient && stompClient.connected) {
        return
      }
      let prefix = '/'
      if (window.DataEaseBi?.baseUrl) {
        prefix = window.DataEaseBi.baseUrl
      } else {
        // const href = window.location.href
        prefix = basePath;
      }
      if (!prefix.endsWith('/')) {
        prefix += '/'
      }
      const userId = wsCache.get('app.desktop') ? 1 : wsCache.get('user.uid')
      const socket = new SockJS(prefix + 'websocket?userId=' + userId)
      stompClient = Stomp.over(socket)
      const heads = {
        userId: userId
      }
      stompClient.connect(
        heads,
        () => {
          channels.forEach(channel => {
            stompClient.subscribe('/user/' + userId + channel.topic, res => {
              res && res.body && useEmitt().emitter.emit(channel.event, res.body)
            })
          })
        },
        error => {
          console.error('连接失败: ' + error)
        }
      )
    }

    function disconnect() {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(
          function () {
            console.info('断开连接')
          },
          function (error) {
            console.info('断开连接失败: ' + error)
          }
        )
      }
    }

    function initialize() {
      connection()
      timeInterval = setInterval(() => {
        if (!isLoginStatus()) {
          disconnect()
          return
        }
        if (!stompClient || !stompClient.connected) {
          connection()
        }
      }, 5000)
    }
    initialize()
  }
}
