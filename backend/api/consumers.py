import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Craftsman


class CraftsmanStatusConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.craftsman_id = self.scope['url_route']['kwargs']['craftsman_id']
        self.group_name   = f'craftsman_status_{self.craftsman_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # ── Always sync from actual job state before reporting status ──
        current = await self.get_current_status_synced()
        await self.send(text_data=json.dumps({
            'type':   'status_update',
            'status': current,
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data   = json.loads(text_data)
        action = data.get('action')

        if action == 'new_booking_ping':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type':    'booking_alert',
                    'message': 'You have a new booking request!',
                }
            )

        elif action == 'refresh_status':
            # Client can request a fresh status check at any time
            current = await self.get_current_status_synced()
            await self.send(text_data=json.dumps({
                'type':   'status_update',
                'status': current,
            }))

    async def status_update(self, event):
        await self.send(text_data=json.dumps({
            'type':   'status_update',
            'status': event['status'],
        }))

    async def booking_alert(self, event):
        await self.send(text_data=json.dumps({
            'type':    'booking_alert',
            'message': event['message'],
        }))

    @database_sync_to_async
    def get_current_status_synced(self):
        """
        Compute availability from live job data, not just the cached DB field.
        Calls sync_availability() so stale values are corrected on every connect.
        """
        try:
            craftsman = Craftsman.objects.get(pk=self.craftsman_id)
            craftsman.sync_availability()   # re-computes from actual job statuses
            return craftsman.availability_status
        except Craftsman.DoesNotExist:
            return 'online'
