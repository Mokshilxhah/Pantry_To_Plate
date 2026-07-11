from django.apps import AppConfig


class AuthAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.auth_app'

    def ready(self):
        try:
            from .subscription_manager import SubscriptionManager
            SubscriptionManager.initialize_default_plans()
            print("Subscription plans initialized successfully.")
        except Exception as e:
            print(f"Error initializing subscription plans: {e}")
