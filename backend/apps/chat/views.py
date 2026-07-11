from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import datetime

from .models import Message
from .serializers import MessageSerializer

def _get_kitchen_id(request):
    kitchen = getattr(request.user, 'kitchen_id', None)
    if kitchen:
        kitchen_id = getattr(kitchen, 'id', kitchen)
        return str(kitchen_id)
    uid = str(getattr(request.user, 'id', 'default'))
    return uid

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Fetch latest 100 messages ordered by created_at descending, then reverse to chronological order
            msgs = list(Message.objects(kitchen_id=request.user.kitchen_id).order_by('-created_at')[:100])
            msgs.reverse()
            
            serializer = MessageSerializer(msgs, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            kid = _get_kitchen_id(request)
            data = request.data
            
            msg_type = data.get('message_type', 'text').lower()
            text = data.get('text', '').strip()
            
            # For poll/file/audio messages, text can be empty if details are provided
            if not text and msg_type not in ('poll', 'file', 'audio') and not data.get('image_url') and not data.get('file_url'):
                return Response({'error': 'Message text cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Initialize poll options list if type == 'poll'
            poll_opts = []
            if msg_type == 'poll':
                raw_opts = data.get('poll_options', []) # Array of strings or dicts
                for opt in raw_opts:
                    if isinstance(opt, dict):
                        poll_opts.append({'text': opt.get('text', '').strip(), 'votes': int(opt.get('votes', 0))})
                    elif isinstance(opt, str) and opt.strip():
                        poll_opts.append({'text': opt.strip(), 'votes': 0})
            
            msg = Message(
                kitchen_id=request.user.kitchen_id,
                sender_id=request.user,
                sender_name=request.user.full_name or "Family Member",
                message_type=msg_type,
                text=text,
                image_url=data.get('image_url', ''),
                file_url=data.get('file_url', ''),
                file_name=data.get('file_name', ''),
                poll_question=data.get('poll_question', ''),
                poll_options=poll_opts,
                voted_by=[]
            )
            msg.save()
            
            serializer = MessageSerializer(msg)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PollVoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        try:
            kid = _get_kitchen_id(request)
            msg = Message.objects(id=message_id, kitchen_id=request.user.kitchen_id).first()
            if not msg:
                return Response({'error': 'Poll message not found'}, status=status.HTTP_404_NOT_FOUND)
            if msg.message_type != 'poll':
                return Response({'error': 'This message is not a poll'}, status=status.HTTP_400_BAD_REQUEST)

            user_id_str = str(request.user.id)
            opt_idx = int(request.data.get('option_index', -1))
            if opt_idx < 0 or opt_idx >= len(msg.poll_options):
                return Response({'error': 'Invalid option index'}, status=status.HTTP_400_BAD_REQUEST)

            # Update option voters list
            # 1. Initialize 'voters' for all options if not present
            for opt in msg.poll_options:
                if 'voters' not in opt:
                    opt['voters'] = []
                    # Keep existing votes as baseline
                    opt['votes'] = int(opt.get('votes', 0))

            # 2. Check if user already voted for this option
            if user_id_str in msg.poll_options[opt_idx]['voters']:
                # They clicked the same option they already voted for -> remove their vote (unvote)
                msg.poll_options[opt_idx]['voters'].remove(user_id_str)
                msg.poll_options[opt_idx]['votes'] = len(msg.poll_options[opt_idx]['voters'])
                if user_id_str in msg.voted_by:
                    msg.voted_by.remove(user_id_str)
            else:
                # 3. If they voted for a different option, remove their vote from the old option first
                for opt in msg.poll_options:
                    if user_id_str in opt['voters']:
                        opt['voters'].remove(user_id_str)
                        opt['votes'] = len(opt['voters'])
                
                # 4. Add vote to the new option
                msg.poll_options[opt_idx]['voters'].append(user_id_str)
                msg.poll_options[opt_idx]['votes'] = len(msg.poll_options[opt_idx]['voters'])
                if user_id_str not in msg.voted_by:
                    msg.voted_by.append(user_id_str)

            msg._mark_as_changed('poll_options')
            msg.save()

            serializer = MessageSerializer(msg)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MessagePinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        try:
            msg = Message.objects(id=message_id, kitchen_id=request.user.kitchen_id).first()
            if not msg:
                return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

            is_pinned = bool(request.data.get('is_pinned', True))
            msg.is_pinned = is_pinned
            if is_pinned:
                msg.pinned_by = request.user
                msg.pinned_at = datetime.utcnow()
            else:
                msg.pinned_by = None
                msg.pinned_at = None
            msg.save()

            serializer = MessageSerializer(msg)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PinnedMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            kid = _get_kitchen_id(request)
            msgs = Message.objects(kitchen_id=request.user.kitchen_id, is_pinned=True).order_by('-pinned_at')
            serializer = MessageSerializer(msgs, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import os
import uuid
from django.core.files.storage import default_storage
from rest_framework.parsers import MultiPartParser, FormParser

class ChatFileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate a secure unique filename
            ext = os.path.splitext(uploaded_file.name)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            
            # Save file to media/chat_uploads/
            file_path = os.path.join('chat_uploads', unique_filename)
            saved_path = default_storage.save(file_path, uploaded_file)
            
            # Generate the serving URL
            from django.conf import settings
            file_url = f"{settings.MEDIA_URL}{saved_path.replace(os.sep, '/')}"
            
            # Detect file type
            file_type = 'file'
            ext_lower = ext.lower()
            if ext_lower in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']:
                file_type = 'image'
            elif ext_lower == '.pdf':
                file_type = 'pdf'
            elif ext_lower in ['.mp3', '.wav', '.ogg', '.m4a', '.webm', '.3gp']:
                file_type = 'audio'
                
            return Response({
                'file_url': file_url,
                'file_name': uploaded_file.name,
                'file_type': file_type
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

