import { useState, useEffect, useRef } from 'react';

export function useCraftsmanStatus(craftsmanId) {
  const [status, setStatus] = useState(null); // null = loading
  const socketRef    = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    if (!craftsmanId) return;

    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(
        `${protocol}://${window.location.host}/ws/craftsman/${craftsmanId}/status/`
      );

      ws.onopen = () => {
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current);
          reconnectRef.current = null;
        }
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'status_update') {
            setStatus(data.status); // 'online' or 'busy'
          }
        } catch {}
      };

      // Do NOT reset to 'online' on close — keep last known status
      ws.onclose = () => {
        if (!destroyed) {
          reconnectRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => ws.close();
      socketRef.current = ws;
    };

    connect();

    return () => {
      destroyed = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      socketRef.current?.close();
    };
  }, [craftsmanId]);

  const pingNewBooking = () => {
    const ws = socketRef.current;
    if (ws?.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify({ action: 'new_booking_ping' }));
  };

  return {
    status: status || 'online',   
    isBusy: status === 'busy',
    pingNewBooking,
  };
}
