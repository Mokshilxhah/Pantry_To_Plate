from django.urls import path, re_path
from .views import MessageListView, PollVoteView, MessagePinView, PinnedMessageListView, ChatFileUploadView

urlpatterns = [
    re_path(r'^messages/?$', MessageListView.as_view(), name='message_list'),
    re_path(r'^messages/pinned/?$', PinnedMessageListView.as_view(), name='pinned_message_list'),
    re_path(r'^messages/(?P<message_id>[^/]+)/vote/?$', PollVoteView.as_view(), name='poll_vote'),
    re_path(r'^messages/(?P<message_id>[^/]+)/pin/?$', MessagePinView.as_view(), name='message_pin'),
    re_path(r'^upload/?$', ChatFileUploadView.as_view(), name='chat_file_upload'),
]

