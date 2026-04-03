import logging
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Craftsman, JobRequest, PlatformSettings
from .serializers import CraftsmanSerializer, JobRequestSerializer
from api.utils import send_staff_welcome_email

logger = logging.getLogger(__name__)
User = get_user_model()


# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────

def is_admin_role(user, *allowed_roles):
    return user.is_authenticated and (
        user.is_staff or
        getattr(user, 'role', None) in (allowed_roles or ['superadmin', 'moderator', 'maintenance', 'support', 'finance', 'analytics'])
    )


class AdminRolePermission:
    def check_admin(self, request):
        if not is_admin_role(request.user):
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        return None

    def check_superadmin(self, request):
        if getattr(request.user, 'role', None) != 'superadmin' and not request.user.is_superuser:
            return Response({'error': 'Superadmin access required.'}, status=status.HTTP_403_FORBIDDEN)
        return None


# ─────────────────────────────────────────────────────────────────
# ADMIN PROFILE
# ─────────────────────────────────────────────────────────────────

class AdminProfileView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        denied = self.check_admin(request)
        if denied:
            return denied

        user = request.user
        return Response({
            'id': user.id,
            'full_name': getattr(user, 'full_name', None) or user.get_full_name(),
            'email': user.email,
            'role': getattr(user, 'role', None) or 'superadmin',
            'is_active': user.is_active,
        })


# ─────────────────────────────────────────────────────────────────
# CRAFTSMEN
# ─────────────────────────────────────────────────────────────────

class AdminCraftsmanListView(generics.ListAPIView, AdminRolePermission):
    serializer_class = CraftsmanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Craftsman.objects.select_related('user')

        is_approved = self.request.query_params.get('is_approved')
        search = self.request.query_params.get('search', '').strip()

        if is_approved is not None:
            qs = qs.filter(is_approved=is_approved.lower() == 'true')

        if search:
            qs = qs.filter(user__full_name__icontains=search)

        return qs.order_by('-id')

    def list(self, request, *args, **kwargs):
        denied = self.check_admin(request)
        if denied:
            return denied
        return super().list(request, *args, **kwargs)


class AdminCraftsmanApproveView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        denied = self.check_admin(request)
        if denied:
            return denied

        try:
            craftsman = Craftsman.objects.get(pk=pk)
        except Craftsman.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        craftsman.is_approved = True
        craftsman.status = 'approved'
        craftsman.save()

        return Response({'status': 'approved'})


class AdminCraftsmanRejectView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        denied = self.check_admin(request)
        if denied:
            return denied

        try:
            craftsman = Craftsman.objects.get(pk=pk)
        except Craftsman.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        craftsman.is_approved = False
        craftsman.status = 'rejected'
        craftsman.save()

        return Response({'status': 'rejected'})


class AdminCraftsmanUpdateView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        denied = self.check_admin(request)
        if denied:
            return denied

        try:
            craftsman = Craftsman.objects.get(pk=pk)
        except Craftsman.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        for field, value in request.data.items():
            setattr(craftsman, field, value)

        craftsman.save()
        return Response({'message': 'Updated'})


class AdminCraftsmanToggleActiveView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        denied = self.check_admin(request)
        if denied:
            return denied

        craftsman = Craftsman.objects.get(pk=pk)
        craftsman.is_active = not craftsman.is_active
        craftsman.save()

        return Response({'is_active': craftsman.is_active})


# ─────────────────────────────────────────────────────────────────
# STAFF MANAGEMENT (FIXED)
# ─────────────────────────────────────────────────────────────────

STAFF_ROLES = ['moderator', 'maintenance', 'support', 'finance', 'analytics']


class AdminStaffView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        denied = self.check_superadmin(request)
        if denied:
            return denied

        staff = User.objects.filter(
            role__in=STAFF_ROLES,
            is_staff=True
        ).order_by('-id')

        data = [{
            'id':     u.id,
            'name':   getattr(u, 'full_name', None) or u.get_full_name(),
            'email':  u.email,
            'role':   getattr(u, 'role', 'support'),
            'active': u.is_active,
            'joined': '',
        } for u in staff]

        return Response(data)

    def post(self, request):                          # ← indented inside the class
        denied = self.check_superadmin(request)
        if denied:
            return denied

        name     = request.data.get('name', '').strip()
        email    = request.data.get('email', '').strip()
        role     = request.data.get('role', 'moderator')
        password = request.data.get('password', '')

        if not all([name, email, password]):
            return Response(
                {'error': 'name, email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if role not in STAFF_ROLES:
            return Response(
                {'error': f'Invalid role. Choose from {STAFF_ROLES}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'A user with this email already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user           = User.objects.create_user(email=email, password=password)
        user.full_name = name
        user.role      = role
        user.is_staff  = True
        user.save()

        send_staff_welcome_email(name, email, password, role)

        return Response({
            'id':     user.id,
            'name':   name,
            'email':  email,
            'role':   role,
            'active': True,
        }, status=status.HTTP_201_CREATED)

class AdminStaffToggleView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        denied = self.check_superadmin(request)
        if denied:
            return denied

        user = User.objects.get(pk=pk, is_staff=True)
        user.is_active = not user.is_active
        user.save()

        return Response({'active': user.is_active})


class AdminStaffDeleteView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        denied = self.check_superadmin(request)
        if denied:
            return denied

        user = User.objects.get(pk=pk, is_staff=True)
        user.delete()

        return Response({'message': 'Deleted'})


# ─────────────────────────────────────────────────────────────────
# JOBS
# ─────────────────────────────────────────────────────────────────

class AdminJobListView(generics.ListAPIView, AdminRolePermission):
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobRequest.objects.all().order_by('-id')

    def list(self, request, *args, **kwargs):
        denied = self.check_admin(request)
        if denied:
            return denied
        return super().list(request, *args, **kwargs)


class AdminJobAssignView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        denied = self.check_admin(request)
        if denied:
            return denied

        job = JobRequest.objects.get(pk=pk)
        craftsman_id = request.data.get('craftsman')

        craftsman = Craftsman.objects.get(pk=craftsman_id)
        job.craftsman = craftsman
        job.status = 'Assigned'
        job.save()

        return Response({'message': 'Assigned'})


class AdminJobPayView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        denied = self.check_admin(request)
        if denied:
            return denied

        job = JobRequest.objects.get(pk=pk)
        job.status = 'Paid'
        job.save()

        return Response({'message': 'Paid'})


# ─────────────────────────────────────────────────────────────────
# SETTINGS
# ─────────────────────────────────────────────────────────────────

class AdminSettingsView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        denied = self.check_admin(request)
        if denied:
            return denied
        s = PlatformSettings.load()
        return Response({
            'commission_pct':     s.commission_pct,
            'min_budget':         s.min_budget,
            'max_budget':         s.max_budget,
            'mpesa_shortcode':    s.mpesa_shortcode,
            'enabled_services':   s.enabled_services,
            'enabled_locations':  s.enabled_locations,
            'notifications':      s.notifications,
        })

    def post(self, request):
        denied = self.check_admin(request)
        if denied:
            return denied
        s = PlatformSettings.load()
        data = request.data
        if 'commission_pct'   in data: s.commission_pct   = data['commission_pct']
        if 'min_budget'       in data: s.min_budget       = data['min_budget']
        if 'max_budget'       in data: s.max_budget       = data['max_budget']
        if 'mpesa_shortcode'  in data: s.mpesa_shortcode  = data['mpesa_shortcode']
        if 'enabled_services' in data: s.enabled_services = data['enabled_services']
        if 'enabled_locations'in data: s.enabled_locations= data['enabled_locations']
        if 'notifications'    in data: s.notifications    = data['notifications']
        s.save()
        return Response({'message': 'Settings saved'})


# ─────────────────────────────────────────────────────────────────
# ANALYTICS
# ─────────────────────────────────────────────────────────────────

class AdminAnalyticsView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'users': User.objects.count(),
            'craftsmen': Craftsman.objects.count(),
            'jobs': JobRequest.objects.count(),
        })
    
class AdminChangePasswordView(APIView, AdminRolePermission):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        denied = self.check_admin(request)
        if denied:
            return denied

        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')

        if not old_password or not new_password:
            return Response(
                {'error': 'Both old_password and new_password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not request.user.check_password(old_password):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.set_password(new_password)
        request.user.save()
        return Response({'message': 'Password changed successfully.'})