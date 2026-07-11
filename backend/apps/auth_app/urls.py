from django.urls import path, re_path
from .views import (
    AdminRegisterView, AdminLoginView,
    MemberRegisterView, MemberLoginView,
    GetInviteCodeView,
    RegisterView, LoginView,
    PasswordStrengthCheckView, ForgotPasswordView,
    ResetPasswordView, ChangePasswordView, ProfileUpdateView, ProfileRequestOTPView,
)
from .subscription_views import (
    GetSubscriptionView, GetAvailablePlansView,
    CheckFeatureAccessView, CheckMemberLimitView,
    InitiateDemoPaymentView, GetPaymentHistoryView,
    GetInvoicesView, CancelSubscriptionView,
)

urlpatterns = [
    # Role-separated endpoints
    re_path(r'^admin/register/?$', AdminRegisterView.as_view(), name='admin_register'),
    re_path(r'^admin/login/?$', AdminLoginView.as_view(), name='admin_login'),
    re_path(r'^member/register/?$', MemberRegisterView.as_view(), name='member_register'),
    re_path(r'^member/login/?$', MemberLoginView.as_view(), name='member_login'),
    re_path(r'^invite-code/?$', GetInviteCodeView.as_view(), name='get_invite_code'),
    
    # Password management endpoints
    re_path(r'^password/strength-check/?$', PasswordStrengthCheckView.as_view(), name='password_strength_check'),
    re_path(r'^password/forgot/?$', ForgotPasswordView.as_view(), name='forgot_password'),
    re_path(r'^password/reset/?$', ResetPasswordView.as_view(), name='reset_password'),
    re_path(r'^password/change/?$', ChangePasswordView.as_view(), name='change_password'),
    re_path(r'^profile/update/?$', ProfileUpdateView.as_view(), name='profile_update'),
    re_path(r'^profile/request-otp/?$', ProfileRequestOTPView.as_view(), name='profile_request_otp'),
    
    # Subscription endpoints
    re_path(r'^subscription/get/?$', GetSubscriptionView.as_view(), name='get_subscription'),
    re_path(r'^subscription/plans/?$', GetAvailablePlansView.as_view(), name='get_plans'),
    re_path(r'^subscription/check-feature/?$', CheckFeatureAccessView.as_view(), name='check_feature'),
    re_path(r'^subscription/check-member-limit/?$', CheckMemberLimitView.as_view(), name='check_member_limit'),
    re_path(r'^subscription/upgrade/?$', InitiateDemoPaymentView.as_view(), name='upgrade_subscription'),
    re_path(r'^subscription/cancel/?$', CancelSubscriptionView.as_view(), name='cancel_subscription'),
    
    # Payment and Invoice endpoints
    re_path(r'^payments/history/?$', GetPaymentHistoryView.as_view(), name='payment_history'),
    re_path(r'^invoices/?$', GetInvoicesView.as_view(), name='get_invoices'),

    # Legacy fallback (kept for backward compat)
    re_path(r'^register/?$', RegisterView.as_view(), name='register'),
    re_path(r'^login/?$', LoginView.as_view(), name='login'),
]

