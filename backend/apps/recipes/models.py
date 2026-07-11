from mongoengine import Document, StringField, ReferenceField, IntField, ListField, DictField, DateTimeField, BooleanField
from datetime import datetime

class Recipe(Document):
    title = StringField(required=True)
    author_id = ReferenceField('User', required=True)
    kitchen_id = ReferenceField('Kitchen', required=True)
    prep_time = IntField()
    cook_time = IntField()
    servings = IntField()
    difficulty = StringField(choices=('easy', 'medium', 'hard'))
    ingredients = ListField(DictField()) # name, quantity, unit, master_item_id
    steps = ListField(StringField())
    tags = ListField(StringField())
    diet_type = StringField(choices=('veg', 'nonveg', 'jain', 'vegan', 'upwas'))
    category = StringField(default='dinner')
    image_url = StringField(default='')
    calories = IntField(default=300)
    protein = IntField(default=10)
    carbs = IntField(default=40)
    fat = IntField(default=10)
    cuisine = StringField(default='Universal')
    is_community_shared = BooleanField(default=False)
    source = StringField(choices=('manual', 'template', 'ai'), default='manual')
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'recipes'}

class CommunityRecipe(Document):
    recipe_id = ReferenceField('Recipe', required=True)
    original_author_id = ReferenceField('User')
    saves_count = IntField(default=0)
    rating_avg = IntField(default=0)
    rating_count = IntField(default=0)
    
    meta = {'collection': 'community_recipes'}

class RecipeLike(Document):
    user_id = ReferenceField('User', required=True)
    recipe_id = ReferenceField('Recipe', required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'recipe_likes',
        'indexes': [
            {'fields': ('user_id', 'recipe_id'), 'unique': True}
        ]
    }

class RecipeSave(Document):
    user_id = ReferenceField('User', required=True)
    recipe_id = ReferenceField('Recipe', required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'recipe_saves',
        'indexes': [
            {'fields': ('user_id', 'recipe_id'), 'unique': True}
        ]
    }

class RecipeComment(Document):
    user_id = ReferenceField('User', required=True)
    recipe_id = ReferenceField('Recipe', required=True)
    comment_text = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {'collection': 'recipe_comments'}

class UserFollow(Document):
    follower_id = ReferenceField('User', required=True)
    following_id = ReferenceField('User', required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_follows',
        'indexes': [
            {'fields': ('follower_id', 'following_id'), 'unique': True}
        ]
    }


class RecipeRating(Document):
    user_id = ReferenceField('User', required=True)
    recipe_id = ReferenceField('Recipe', required=True)
    rating = IntField(required=True, choices=(1, 2, 3, 4, 5))
    review_text = StringField(default='')
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'recipe_ratings',
        'indexes': [
            {'fields': ('user_id', 'recipe_id'), 'unique': True}
        ]
    }

    def to_dict(self):
        return {
            'id': str(self.pk),
            'user_id': str(self.user_id.id) if self.user_id else None,
            'recipe_id': str(self.recipe_id.id) if self.recipe_id else None,
            'rating': self.rating,
            'review_text': self.review_text,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class FoodGalleryPost(Document):
    user_id = ReferenceField('User', required=True)
    image_url = StringField(required=True)
    caption = StringField(default='')
    likes_count = IntField(default=0)
    liked_users = ListField(StringField(), default=list)  # list of user IDs who liked it
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'food_gallery_posts',
        'indexes': ['user_id', '-created_at'],
    }

    def to_dict(self, current_user=None):
        liked = False
        if current_user:
            liked = str(current_user.id) in self.liked_users
        author_name = self.user_id.full_name if self.user_id else "Anonymous Chef"
        return {
            'id': str(self.pk),
            'user_id': str(self.user_id.id) if self.user_id else None,
            'author_name': author_name,
            'initials': "".join([p[0] for p in author_name.split() if p]).upper()[:2],
            'image_url': self.image_url,
            'caption': self.caption,
            'likes_count': self.likes_count,
            'liked': liked,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CommunityChallenge(Document):
    title = StringField(required=True)
    description = StringField(required=True)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'community_challenges',
        'ordering': ['-created_at'],
    }

    def to_dict(self):
        return {
            'id': str(self.pk),
            'title': self.title,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

