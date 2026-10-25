import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useAlertas() {
  const [alertas, setAlertas] = useState([])
  const clientRef = useRef(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        client.subscribe('/topic/alertas', (message) => {
          try {
            const alerta = JSON.parse(message.body)
            setAlertas(prev => [alerta, ...prev])

            // Beep de alerta sonoro para casos urgentes
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)()
              const oscillator = ctx.createOscillator()
              const gainNode = ctx.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(ctx.destination)
              oscillator.frequency.value = alerta.cor === 'VERMELHO' ? 880 : 660
              gainNode.gain.value = 0.3
              oscillator.start()
              setTimeout(() => oscillator.stop(), 600)
            } catch (e) {}

            // Notificação do navegador
            if (Notification.permission === 'granted') {
              new Notification(`🚨 TRIAGEM URGENTE: ${alerta.cor}`, {
                body: `${alerta.nomePaciente}: ${alerta.sintomas}`,
                icon: '/favicon.svg'
              })
            }
          } catch (err) {
            console.error('Erro ao processar mensagem do websocket:', err)
          }
        })
      },
      reconnectDelay: 5000,
    })

    client.activate()
    clientRef.current = client

    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => client.deactivate()
  }, [])

  function removerAlerta(index) {
    setAlertas(prev => prev.filter((_, i) => i !== index))
  }

  return { alertas, removerAlerta }
}
