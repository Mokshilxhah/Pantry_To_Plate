# 🍽️ Pantry to Plate — Complete Project Documentation

> **Version:** 1.0.0 | **Author:** Project Architect | **Status:** Pre-Development Blueprint  
> **Motto:** *"No more 'what to cook today?' — Let AI manage your kitchen, family, and table."*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Vision & Mission](#2-vision--mission)
3. [Target Audience](#3-target-audience)
4. [Complete Feature List](#4-complete-feature-list)
5. [Tech Stack](#5-tech-stack)
6. [System Architecture](#6-system-architecture)
7. [Database Design (MongoDB)](#7-database-design-mongodb)
8. [Python Pantry Item Master Database](#8-python-pantry-item-master-database)
9. [Backend API Design (Django REST Framework)](#9-backend-api-design-django-rest-framework)
10. [AI/ML Module Design](#10-aiml-module-design)
11. [Frontend Architecture (React)](#11-frontend-architecture-react)
12. [Landing Page Design](#12-landing-page-design)
13. [Authentication & Authorization Flow](#13-authentication--authorization-flow)
14. [Admin Dashboard](#14-admin-dashboard)
15. [Pantry Management Module](#15-pantry-management-module)
16. [To-Buy List Module](#16-to-buy-list-module)
17. [Family Integration Module](#17-family-integration-module)
18. [Family Chat & Communication Module](#18-family-chat--communication-module)
19. [Food Alerts & Notifications Module](#19-food-alerts--notifications-module)
20. [Dietary Preferences & Allergy Management](#20-dietary-preferences--allergy-management)
21. [Recipe & Community Module](#21-recipe--community-module)
22. [AI Food Suggestion Engine](#22-ai-food-suggestion-engine)
23. [3-Course Meal Planner](#23-3-course-meal-planner)
24. [Admin Analytics & Progress Reports](#24-admin-analytics--progress-reports)
25. [Member Dashboard](#25-member-dashboard)
26. [UI/UX Design System](#26-uiux-design-system)
27. [Advanced / Next-Level Features](#27-advanced--next-level-features)
28. [Security Architecture](#28-security-architecture)
29. [File & Media Storage](#29-file--media-storage)
30. [Notifications Infrastructure](#30-notifications-infrastructure)
31. [Deployment Architecture](#31-deployment-architecture)
32. [Project Folder Structure](#32-project-folder-structure)
33. [Development Phases & Milestones](#33-development-phases--milestones)
34. [API Endpoint Reference](#34-api-endpoint-reference)
35. [Environment Variables & Configuration](#35-environment-variables--configuration)
36. [Testing Strategy](#36-testing-strategy)
37. [Error Handling & Logging](#37-error-handling--logging)
38. [Internationalisation & Localisation](#38-internationalisation--localisation)
39. [Accessibility (a11y)](#39-accessibility-a11y)
40. [Future Roadmap](#40-future-roadmap)

---

## 1. Project Overview

**Pantry to Plate** is an AI-powered, family-collaborative kitchen and pantry management web application. It solves one of the most universal household problems: *What do I cook today?* By combining real-time pantry tracking, intelligent meal suggestions powered by machine learning, family collaboration tools, dietary preference filtering, and a community recipe space — Pantry to Plate becomes the central nervous system of every household kitchen.

The platform operates on a **Hub & Spoke model** — one **Admin** (typically the head of household, or primary cook) creates the family kitchen space and manages permissions, while **Members** (family or household co-members) collaborate in real-time.

### Core Problems Solved

| Problem | Solution |
|---|---|
| "What to cook today?" | AI-powered meal suggestion from current pantry |
| "What ingredients do I need?" | Smart To-Buy list auto-generated from meal plans |
| "The milk expired again!" | Expiry & freshness alerts system |
| "Is this dish safe for everyone?" | Allergy & dietary preference engine |
| "How do I make this dish?" | Step-by-step recipes + YouTube tutorial links |
| "We always forget to restock X" | Usage tracking and auto-restocking suggestions |
| "Everyone has different food preferences" | Family polls, shared meal plans, personalized filters |

---

## 2. Vision & Mission

**Vision:** To be the most intelligent, family-friendly kitchen companion that every household — from urban apartments to joint families — relies on daily.

**Mission:** Remove the daily stress of meal planning by combining AI intelligence with human collaboration, making every pantry smart, every meal enjoyable, and every kitchen worry-free.

### Core Values

- **Simplicity First** — Every feature must be usable by a non-tech-savvy householder.
- **Family Togetherness** — Tech that brings families to the table, not apart.
- **Zero Food Waste** — AI suggestions prioritize ingredients near expiry.
- **Cultural Respect** — Support for Jain, Upwas, Vegan, Non-Veg, regional diets.
- **Data Privacy** — Family food data is sensitive. Zero data selling policy.

---

## 3. Target Audience

### Primary Users

- **Home Admins** — Mother, Father, or primary cook managing daily meals for the family
- **Nuclear Families** — 2–5 members, urban India, Tier 1 & Tier 2 cities
- **Joint Families** — 6–15 members, complex dietary needs
- **Working Couples** — Quick meal suggestions, minimal time for planning
- **Students in PGs/Hostels** — Shared kitchen management (future)

### Secondary Users

- **Health-conscious individuals** — Calorie tracking, nutrition focus
- **Food allergy families** — Nut allergies, lactose intolerance, gluten-free
- **Religious diet households** — Jain, Upwas, Sattvic, Kosher, Halal

### User Personas

**Persona 1 — Sunita (Admin / Mother)**
- Age: 38, Homemaker + Part-time teacher
- Manages kitchen for 5 family members
- Needs: Quick meal ideas, expiry alerts, grocery list on phone, recipe guidance
- Pain: Forgets what's in pantry, kids have different food preferences

**Persona 2 — Rahul (Member / Teen Son)**
- Age: 16, Student
- Wants to help with grocery runs, check what to cook for himself
- Needs: Simple pantry view, quick messaging with mom about food

**Persona 3 — Priya (Admin / Working Professional)**
- Age: 29, Software Engineer
- Manages pantry with husband
- Needs: Minimal time investment, AI meal suggestions, smart grocery lists

---

## 4. Complete Feature List

### 4.1 Landing Page Features
- Hero Section with animated tagline and CTA
- Feature Showcase with animated icons
- How It Works (3-step visual walkthrough)
- AI Demo Section (interactive pantry → meal suggestion preview)
- Testimonials Carousel
- Pricing/Plans Section (Free, Family, Premium)
- Community Recipes Preview
- FAQ Accordion
- Newsletter Signup
- Footer with social links

### 4.2 Authentication System
- Admin Sign Up (email, password, family name, food type preference)
- Admin Login
- Member Join via Invite Code
- Forgot Password / Reset Password
- Email Verification for new accounts
- Google OAuth (optional)
- Session management with JWT + Refresh Tokens
- Role-based access: Admin, Member, Guest (read-only preview)

### 4.3 Pantry Management (CRUD)
- Categorized pantry view (Fruits, Vegetables, Dairy, Pulses, Spices, Oils, etc.)
- Search & Filter by name, category, expiry date
- Add Item (name autofilled from master DB, quantity, unit, purchase date, expiry date, location like fridge/shelf)
- Edit Item (quick inline edit)
- Remove Item (with confirmation)
- Bulk Add (paste CSV / scan receipt — advanced)
- Barcode scanner integration (mobile)
- Expiry countdown badge on each item
- "Running Low" threshold flag
- Item history log (who added/removed)
- Photo upload for custom items

### 4.4 To-Buy List
- Auto-generated suggestions based on pantry gaps + meal plans
- Manual add/remove items
- Check off items while shopping (with auto-pantry-update option)
- Assign items to family members (e.g., "Rahul buys milk")
- Quantity & unit specification
- Category-wise shopping view (group by store section)
- Estimated cost tracking (optional)
- Share list via WhatsApp / SMS
- History of completed shopping trips
- Smart suggestions: "You usually buy X every 2 weeks"

### 4.5 Family Integration
- Admin creates family kitchen space (auto-generated unique Kitchen Code)
- Admin sends personalized invite emails to family members
- Members click link → enter Kitchen Code → create account
- Member roles: Full Access, View Only, Limited (no delete)
- Admin can revoke access anytime
- Member profile: Name, photo, dietary preferences, allergies
- Family member list view with status (Active/Inactive)

### 4.6 Family Communication
- **Group Chat** — Real-time family kitchen chat
- **Daily Meal Broadcast** — Admin sends today's meal plan to all members
- **Polls** — Admin creates food polls ("Biryani or Roti tonight?")
- **Reaction emojis** on meal announcements
- **Recipe Sharing** — Member shares recipe link in chat
- **Reminders** — Admin sets reminders for tasks ("Buy groceries before 6 PM")
- **Notification badges** on unread messages
- **Message types**: Text, Image (food photo), Voice note (future), Poll, Meal Card

### 4.7 Food Alerts & Notifications
- **Expiry Alert** — 3 days, 1 day, same day warnings
- **Freshness Alert** — Produce freshness degradation based on storage duration
- **Running Low Alert** — When item drops below set threshold
- **Restocking Alert** — Based on usage frequency and last purchase
- **Dairy Tracking Alert** — Special freshness tracking for milk, curd, cheese, paneer
- **Frozen Item Alert** — Track freeze duration for meat, frozen veg
- **Purchase Reminder** — Based on consumption patterns
- **Admin-only Alerts** — All critical alerts only go to Admin
- **Alert Center Dashboard** — All active alerts with priority levels (Critical/Warning/Info)
- Notification channels: In-app, Email, Push notification (PWA)

### 4.8 Dietary Preferences & Allergy Management
- **Diet Types**: Vegetarian, Non-Vegetarian, Vegan, Jain, Upwas (fasting), Sattvic, Eggetarian, Keto, Gluten-Free, Diabetic-friendly
- **Per-Member Preferences** set by Admin
- **Allergy Profiles**: Nut, Dairy, Gluten, Soy, Shellfish, custom
- **Restricted Ingredients** list — Admin marks items never to use
- **Meal Suggestions respect all active family preferences** (intersection logic)
- **Color-coded badges** on recipes (Green = safe, Yellow = check, Red = avoid)
- **Override mode** — Admin can allow exceptions for specific occasions

### 4.9 Recipe & Community Module
- **Recipe Library** — Curated recipes mapped to pantry items
- **Step-by-step Cooking Instructions** (numbered, with timer hints)
- **YouTube Tutorial Links** embedded per recipe
- **Nutritional Info** per recipe (calories, protein, carbs, fat)
- **Difficulty Level** (Easy / Medium / Hard)
- **Cooking Time** (Prep + Cook)
- **Serves** (adjustable serving size)
- **Ingredient Availability Check** — "You have 8/10 ingredients. Missing: Coriander, Cumin"
- **Community Section**:
  - Admins share personalized home recipes
  - Tips & tricks posts
  - Upvote / Downvote recipes
  - Save to personal cookbook
  - Comment on community recipes
  - Follow other kitchen admins
  - Tags: #Jain, #QuickMeal, #KidFriendly, #Monsoon, etc.

### 4.10 AI Food Suggestion Engine
- Analyzes current pantry contents
- Considers dietary filters for all family members
- Prioritizes near-expiry items (zero waste)
- Suggests 3-5 dishes instantly
- Explains why each dish is suggested ("Uses expiring spinach + available dal")
- Learns from family's accepted/rejected suggestions (reinforcement feedback)
- Weekly meal planner auto-generation
- Alternative ingredient suggestions ("No ginger? Use ginger powder")
- Quick Snack vs Full Meal toggle

### 4.11 3-Course Meal Planner
- AI generates Starter + Main Course + Dessert from pantry
- One-click accept / regenerate options
- Nutritional balance check across 3 courses
- Seasonal suggestions (e.g., summer coolants, winter warmers)
- Festival-specific meal plans (Diwali, Navratri, Eid, Christmas)
- Save meal plan as "Today's Menu"
- Print/Share today's menu

### 4.12 Admin Analytics & Progress Reports
- **Pantry Health Score** — % of items fresh vs expiring
- **Most Used Ingredients** (weekly/monthly)
- **Most Cooked Dishes** (admin logs meals made)
- **Shopping Frequency** — How often items are bought
- **Food Waste Tracker** — Items removed without using
- **Dairy Tracker** — Milk, curd consumption trends
- **Member Activity** — Who updates pantry most, who checks recipes
- **Budget Estimation** — Monthly grocery cost estimate
- **Seasonal Trend Report** — What's bought more in which season
- **Allergy Safety Score** — How well dietary rules are followed
- Visual charts: Bar, Pie, Line (Recharts / Chart.js)

---

## 5. Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library (SPA) |
| Vite | Build tool (fast dev server) |
| React Router v6 | Client-side routing |
| Zustand | Global state management (lightweight) |
| TailwindCSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| Axios | HTTP client |
| Socket.io-client | Real-time chat |
| React Query (TanStack) | Server state, caching, refetching |
| Recharts | Analytics charts |
| React Hook Form + Zod | Form handling + validation |
| React Toastify | Toast notifications |
| Lucide React | Icon library |
| Day.js | Date formatting |
| i18next | Internationalisation |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11 | Core language |
| Django 4.2 | Web framework |
| Django REST Framework | API layer |
| Django Channels | WebSocket support (real-time chat) |
| Celery | Background tasks (alerts, emails) |
| Redis | Cache + Celery broker + WebSocket channel layer |
| JWT (SimpleJWT) | Authentication tokens |
| Pillow | Image processing |
| python-barcode | Barcode item lookup |
| SendGrid / SMTP | Email delivery |
| BeautifulSoup | YouTube link scraping for recipes |

### AI/ML Stack
| Technology | Purpose |
|---|---|
| Scikit-learn | Collaborative filtering, classification |
| TensorFlow / Keras | Deep learning for meal suggestion model |
| Pandas & NumPy | Data processing |
| spaCy | NLP for recipe parsing, ingredient extraction |
| Surprise Library | Recommendation system |
| OpenCV | Barcode / receipt scanning (optional) |
| Custom NER Model | Named Entity Recognition for ingredient names |
| Content-Based Filtering | Pantry-to-recipe matching |
| Hybrid Recommendation | Collaborative + Content-based |

### Database
| Technology | Purpose |
|---|---|
| MongoDB (Atlas) | Primary NoSQL database |
| PyMongo / MongoEngine | ODM for Django |
| Redis | Caching, sessions, channel layer |
| MongoDB GridFS | File/image storage (receipts, food photos) |

### DevOps & Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerisation |
| Nginx | Reverse proxy |
| Gunicorn | WSGI server |
| Daphne | ASGI server (for Django Channels) |
| AWS S3 | Static & media files |
| Cloudflare | CDN + DDoS protection |
| GitHub Actions | CI/CD pipeline |
| Sentry | Error monitoring |
| Datadog / Grafana | Performance monitoring |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│              React SPA (Vite) — Served via CDN (Cloudflare)         │
│   Landing Page | Admin Dashboard | Member Dashboard | Community      │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼────────────────────────────────────────┐
│                        NGINX REVERSE PROXY                           │
│         Routes: /api/* → Gunicorn | /ws/* → Daphne                  │
└──────────────┬───────────────────────────────┬──────────────────────┘
               │                               │
┌──────────────▼──────────┐    ┌───────────────▼─────────────────────┐
│   Django REST Framework  │    │     Django Channels (ASGI)           │
│   (HTTP APIs — Gunicorn) │    │     (WebSocket — Daphne)             │
│  Auth | Pantry | Recipe  │    │  Real-time Chat | Alerts | Polls     │
│  Alerts | AI | Reports   │    │  Channel Layer: Redis                │
└──────────────┬───────────┘    └───────────────┬─────────────────────┘
               │                               │
┌──────────────▼───────────────────────────────▼─────────────────────┐
│                         SERVICE LAYER                                │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────────┐ │
│  │  Celery Workers │  │  AI/ML Services │  │   Notification Svc   │ │
│  │  (Background)   │  │  (Recommendation│  │  Email | Push | SMS  │ │
│  │  Expiry checks  │  │  Meal Suggest   │  │  SendGrid / Firebase │ │
│  │  Weekly reports │  │  Waste Predict  │  └──────────────────────┘ │
│  └────────────────┘  └─────────────────┘                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                          DATA LAYER                                  │
│  ┌───────────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  MongoDB Atlas     │  │  Redis Cache │  │    AWS S3             │ │
│  │  (Primary DB)      │  │  Sessions    │  │   Images / Files      │ │
│  │  All collections   │  │  Rate limits │  │   Receipts / Media    │ │
│  └───────────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow — Meal Suggestion Request

```
User clicks "Suggest Meal"
        │
        ▼
React → POST /api/ai/suggest-meal/
        │
        ▼
Django View → Fetch pantry items from MongoDB
        │
        ▼
Filter by dietary preferences + allergies
        │
        ▼
Sort by expiry date (near-expiry items prioritized)
        │
        ▼
Pass to ML Model (content-based filtering)
        │
        ▼
Model returns ranked recipe list (top 5)
        │
        ▼
Enrich with recipe details, YouTube links, availability check
        │
        ▼
Return JSON to React → Display suggestion cards
```

---

## 7. Database Design (MongoDB)

### Collections Overview

```
pantrytoplate_db/
├── users
├── kitchens
├── pantry_items
├── master_items          ← Read-only master food database
├── categories
├── to_buy_lists
├── to_buy_items
├── recipes
├── community_recipes
├── meal_plans
├── chat_messages
├── polls
├── poll_votes
├── notifications
├── alerts
├── dietary_profiles
├── analytics_logs
├── invite_codes
└── activity_logs
```

### Collection Schemas

#### users
```json
{
  "_id": "ObjectId",
  "email": "string (unique, indexed)",
  "password_hash": "string",
  "full_name": "string",
  "phone": "string (optional)",
  "profile_photo": "string (S3 URL)",
  "role": "admin | member",
  "kitchen_id": "ObjectId (ref: kitchens)",
  "dietary_profile_id": "ObjectId (ref: dietary_profiles)",
  "is_verified": "boolean",
  "is_active": "boolean",
  "last_login": "datetime",
  "created_at": "datetime",
  "updated_at": "datetime",
  "device_tokens": ["string"],
  "notification_preferences": {
    "email": "boolean",
    "push": "boolean",
    "in_app": "boolean"
  }
}
```

#### kitchens
```json
{
  "_id": "ObjectId",
  "kitchen_name": "string",
  "admin_id": "ObjectId (ref: users)",
  "member_ids": ["ObjectId"],
  "invite_code": "string (unique, 8-char)",
  "invite_code_expiry": "datetime",
  "kitchen_type": "nuclear | joint | couple | single",
  "default_diet_type": "veg | nonveg | jain | upwas | mixed",
  "timezone": "string",
  "currency": "string (INR default)",
  "created_at": "datetime",
  "settings": {
    "allow_member_delete": "boolean",
    "alert_advance_days": "integer (default: 3)",
    "low_stock_threshold": "integer (default: 2)",
    "auto_buylist": "boolean"
  }
}
```

#### pantry_items
```json
{
  "_id": "ObjectId",
  "kitchen_id": "ObjectId (indexed)",
  "master_item_id": "ObjectId (ref: master_items, optional)",
  "name": "string",
  "category": "string",
  "sub_category": "string",
  "quantity": "number",
  "unit": "string (kg | g | L | ml | pieces | packets | boxes)",
  "purchase_date": "date",
  "expiry_date": "date (optional)",
  "best_before": "date (optional)",
  "storage_location": "fridge | freezer | shelf | counter | pantry_cabinet",
  "brand": "string (optional)",
  "notes": "string (optional)",
  "image_url": "string (optional)",
  "low_stock_threshold": "number",
  "is_essential": "boolean",
  "added_by": "ObjectId (ref: users)",
  "updated_by": "ObjectId (ref: users)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "status": "fresh | expiring_soon | expired | low_stock"
}
```

#### master_items
```json
{
  "_id": "ObjectId",
  "name": "string",
  "aliases": ["string"],
  "category": "string",
  "sub_category": "string",
  "default_unit": "string",
  "avg_shelf_life_days": "integer",
  "storage_tip": "string",
  "nutrition_per_100g": {
    "calories": "number",
    "protein": "number",
    "carbs": "number",
    "fat": "number",
    "fiber": "number",
    "vitamins": ["string"]
  },
  "diet_tags": ["veg", "jain", "vegan", "upwas"],
  "allergen_tags": ["dairy", "gluten", "nut"],
  "is_perishable": "boolean",
  "seasonal": "string (optional)",
  "barcode": "string (optional)",
  "hindi_name": "string",
  "gujarati_name": "string",
  "regional_names": { "gu": "...", "hi": "...", "mr": "..." }
}
```

#### recipes
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "course": "starter | main | dessert | snack | drink | breakfast",
  "cuisine": "string",
  "diet_tags": ["veg", "jain", "vegan"],
  "allergen_warnings": ["dairy", "nut"],
  "difficulty": "easy | medium | hard",
  "prep_time_mins": "integer",
  "cook_time_mins": "integer",
  "serves": "integer",
  "ingredients": [
    {
      "master_item_id": "ObjectId",
      "name": "string",
      "quantity": "number",
      "unit": "string",
      "is_optional": "boolean",
      "substitute": "string (optional)"
    }
  ],
  "steps": [
    {
      "step_no": "integer",
      "instruction": "string",
      "timer_mins": "integer (optional)",
      "tip": "string (optional)"
    }
  ],
  "nutrition_per_serving": {
    "calories": "number",
    "protein": "number",
    "carbs": "number",
    "fat": "number"
  },
  "youtube_link": "string (optional)",
  "thumbnail_url": "string",
  "is_community": "boolean",
  "author_id": "ObjectId (if community)",
  "rating_avg": "number",
  "rating_count": "integer",
  "tags": ["string"],
  "season": "all | summer | winter | monsoon | festive",
  "festival": "string (optional)",
  "created_at": "datetime"
}
```

#### chat_messages
```json
{
  "_id": "ObjectId",
  "kitchen_id": "ObjectId (indexed)",
  "sender_id": "ObjectId (ref: users)",
  "message_type": "text | image | meal_card | poll | reminder | recipe_share",
  "content": "string",
  "metadata": {
    "meal_plan_id": "ObjectId (optional)",
    "recipe_id": "ObjectId (optional)",
    "poll_id": "ObjectId (optional)",
    "image_url": "string (optional)"
  },
  "reactions": [{ "user_id": "ObjectId", "emoji": "string" }],
  "is_deleted": "boolean",
  "created_at": "datetime"
}
```

#### dietary_profiles
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "kitchen_id": "ObjectId",
  "diet_type": ["veg", "jain", "upwas"],
  "allergies": ["nut", "dairy", "gluten"],
  "disliked_items": ["ObjectId"],
  "preferred_cuisines": ["Gujarati", "South Indian"],
  "calorie_goal": "number (optional)",
  "medical_restrictions": "string (optional)",
  "updated_at": "datetime"
}
```

#### alerts
```json
{
  "_id": "ObjectId",
  "kitchen_id": "ObjectId",
  "pantry_item_id": "ObjectId",
  "alert_type": "expiry | low_stock | freshness | restock | dairy_check | frozen_duration",
  "severity": "critical | warning | info",
  "message": "string",
  "is_read": "boolean",
  "is_dismissed": "boolean",
  "triggered_at": "datetime",
  "auto_resolved_at": "datetime (optional)"
}
```

#### polls
```json
{
  "_id": "ObjectId",
  "kitchen_id": "ObjectId",
  "created_by": "ObjectId",
  "question": "string",
  "options": [{ "id": "string", "label": "string" }],
  "votes": [{ "user_id": "ObjectId", "option_id": "string" }],
  "expires_at": "datetime",
  "status": "active | closed",
  "created_at": "datetime"
}
```

---

## 8. Python Pantry Item Master Database

The master database seeds MongoDB with categorized food items. Below is the complete category structure with representative items.

### Category Tree

```
master_food_items/
│
├── FRUITS
│   ├── Tropical: Mango, Papaya, Pineapple, Banana, Coconut, Litchi, Jackfruit, Guava
│   ├── Citrus: Orange, Lemon, Lime, Grapefruit, Mandarin, Sweet Lime (Mosambi)
│   ├── Berries: Strawberry, Blueberry, Raspberry, Grapes (Green/Black), Amla (Gooseberry)
│   ├── Stone Fruits: Mango (Alphonso, Kesar, Dussehri), Peach, Plum, Cherry, Jamun
│   ├── Common: Apple (Red/Green), Pear, Watermelon, Muskmelon, Kiwi, Pomegranate
│   └── Dry Fruits: Dates, Fig, Raisins, Prunes
│
├── VEGETABLES
│   ├── Leafy Greens: Spinach, Fenugreek (Methi), Coriander, Mint, Curry Leaves,
│   │                 Amaranth (Rajgira Leaves), Bathua, Dill (Suwa), Brahmi
│   ├── Root Vegetables: Potato, Sweet Potato, Carrot, Beetroot, Radish (Mooli),
│   │                    Turnip, Yam (Suran), Colocasia (Arbi), Raw Banana
│   ├── Gourds: Bottle Gourd (Dudhi), Ridge Gourd (Turai), Bitter Gourd (Karela),
│   │           Snake Gourd, Sponge Gourd, Round Gourd (Tinda), Ash Gourd
│   ├── Cruciferous: Cauliflower, Broccoli, Cabbage, Kohlrabi (Knol Khol), Brussels Sprouts
│   ├── Nightshades: Tomato, Brinjal (Baingan), Green Capsicum, Red/Yellow Capsicum
│   ├── Alliums: Onion, Garlic, Ginger, Shallots, Green Onion (Spring Onion), Leek
│   ├── Pods/Legumes: Green Peas, Broad Beans, French Beans, Cluster Beans (Gavar),
│   │                 Drumstick (Saragvo), Flat Beans (Val Papdi)
│   ├── Mushrooms: Button, Oyster, Shiitake
│   └── Others: Corn (Makai), Okra (Bhindi), Lotus Stem (Kamal Kakdi)
│
├── PULSES & LEGUMES (Dal)
│   ├── Lentils: Red Lentil (Masoor), Split Green Lentil (Moong Dal), Split Black Gram (Urad Dal),
│   │            Split Bengal Gram (Chana Dal), Split Pigeon Pea (Toor/Arhar Dal)
│   ├── Whole: Whole Moong, Whole Masoor, Kidney Beans (Rajma), Black Eyed Peas (Chawli),
│   │          Chickpeas (Chhole/Kabuli Chana), Black Chickpeas (Kala Chana), Moth Beans,
│   │          Val, Matki (Moth), Vatana (Dried White Peas), Green Peas (Dried)
│   └── Processed: Besan (Chickpea Flour), Sattu
│
├── GRAINS & CEREALS
│   ├── Rice: Basmati, Sona Masoori, Brown Rice, Parboiled Rice, Poha (Flattened Rice),
│   │         Puffed Rice (Murmura), Rice Flour
│   ├── Wheat: Whole Wheat Flour (Atta), Refined Flour (Maida), Semolina (Suji/Rava),
│   │          Bread, Roti/Chapati (ready), Vermicelli (Seviyan), Dalia (Broken Wheat)
│   ├── Millets: Jowar, Bajra, Ragi (Nachni), Foxtail Millet, Barnyard Millet (Sama for Upwas),
│   │            Pearl Millet, Finger Millet, Amaranth (Rajgira for Upwas)
│   ├── Other: Oats, Quinoa, Corn Flour, Arrowroot, Sabudana (Tapioca Pearls for Upwas)
│   └── Pasta/Noodles: Pasta (various types), Noodles, Maggi/Instant Noodles
│
├── DAIRY & EGGS
│   ├── Milk: Full Fat Milk, Toned Milk, Skimmed Milk, Soy Milk, Almond Milk, Oat Milk
│   ├── Fermented: Curd (Dahi), Buttermilk (Chaas), Lassi
│   ├── Cheese: Paneer, Cottage Cheese, Mozzarella, Processed Cheese, Cheese Slices
│   ├── Fat: Ghee (Cow/Buffalo), Butter (Salted/Unsalted), Cream (Fresh/Whipping), Malai
│   └── Eggs: Chicken Eggs, Duck Eggs (regional)
│
├── NON-VEGETARIAN
│   ├── Poultry: Chicken (Whole/Curry Cut/Boneless/Minced), Eggs
│   ├── Mutton/Lamb: Curry Cut, Minced (Keema), Liver
│   ├── Fish: Rohu, Katla, Pomfret, Surmai (Kingfish), Prawns, Tuna (Canned)
│   └── Processed: Chicken Salami, Sausages (regional)
│
├── SPICES & CONDIMENTS
│   ├── Whole Spices: Cumin (Jeera), Mustard Seeds (Rai), Fenugreek Seeds (Methi Dana),
│   │                 Coriander Seeds, Black Pepper, Cloves, Cardamom (Green/Black),
│   │                 Cinnamon, Bay Leaves, Star Anise, Fennel Seeds (Saunf),
│   │                 Caraway Seeds (Shah Jeera), Nigella Seeds (Kalonji), Asafoetida (Hing)
│   ├── Ground Spices: Turmeric (Haldi), Red Chilli Powder, Coriander Powder (Dhania),
│   │                  Cumin Powder, Garam Masala, Kitchen King, Pav Bhaji Masala,
│   │                  Sambar Powder, Rasam Powder, Chaat Masala, Amchur (Dry Mango Powder),
│   │                  Kashmiri Chilli Powder, Pepper Powder, Dried Ginger Powder (Sonth)
│   ├── Salt & Acids: Rock Salt, Sea Salt, Black Salt (Kala Namak), Table Salt,
│   │                 Tamarind, Kokum, Lemon (as condiment), Vinegar
│   └── Herbs (Dried): Oregano, Basil, Thyme, Rosemary, Mixed Herbs
│
├── OILS & FATS
│   ├── Vegetable Oils: Sunflower Oil, Soybean Oil, Groundnut Oil (Peanut Oil),
│   │                   Mustard Oil, Rice Bran Oil, Sesame Oil (Til Tel)
│   ├── Premium Oils: Coconut Oil, Extra Virgin Olive Oil, Avocado Oil
│   └── Solid Fats: Ghee, Butter, Dalda (Vanaspati), Margarine
│
├── SWEETENERS & SUGARS
│   ├── Sugars: White Sugar, Raw Sugar, Brown Sugar, Powdered Sugar (Icing Sugar)
│   ├── Natural Sweeteners: Jaggery (Gur), Raw Jaggery, Khandsari, Mishri (Rock Sugar)
│   ├── Syrups: Honey, Maple Syrup, Agave Nectar, Rose Water (Gulab Jal)
│   └── Artificial: Stevia, Splenda (diabetic-friendly)
│
├── NUTS & SEEDS
│   ├── Tree Nuts: Almonds, Cashews, Walnuts, Pistachios, Macadamia, Pecans, Hazelnuts
│   ├── Groundnuts: Roasted Peanuts, Raw Peanuts, Peanut Butter
│   ├── Seeds: Sesame (Til), Flax Seeds (Alsi), Chia Seeds, Pumpkin Seeds,
│   │          Sunflower Seeds, Watermelon Seeds, Poppy Seeds (Khus Khus), Hemp Seeds
│   └── Dry Fruits: Raisins (Kishmish), Sultanas, Dried Apricot, Dates (Khajur),
│                   Dried Figs (Anjeer), Prunes, Dried Cranberries
│
├── BEVERAGES
│   ├── Tea: Loose Tea Leaves, Tea Bags (Black, Green, Herbal), Chai Masala, Tulsi Tea
│   ├── Coffee: Ground Coffee, Instant Coffee, Chicory
│   ├── Health Drinks: Turmeric Milk Powder, Chyawanprash, Protein Powder, Horlicks, Bournvita
│   └── Cold: Squash (Lemon/Orange/Rose), Sharbat, Coconut Water, Soft Drinks
│
├── PICKLES, JAMS & PRESERVES
│   ├── Pickles: Mango Pickle, Lemon Pickle, Mixed Pickle, Garlic Pickle, Chilli Pickle
│   ├── Chutneys: Tamarind Chutney, Coriander Chutney (bottled), Coconut Chutney Powder
│   ├── Jams: Mixed Fruit Jam, Strawberry Jam, Mango Jam
│   └── Sauces: Tomato Ketchup, Soy Sauce, Hot Sauce, Worcestershire Sauce,
│               Mayonnaise, Mustard Sauce
│
├── BAKING & COOKING ESSENTIALS
│   ├── Leavening: Baking Powder, Baking Soda, Yeast (Active/Instant), Eno Salt
│   ├── Binding: Cornstarch, Arrowroot Powder, Agar Agar, Gelatin
│   ├── Flavoring: Vanilla Essence, Rose Essence, Kewra Water, Orange Zest (Dried)
│   ├── Chocolate: Cocoa Powder, Dark Chocolate (Chips/Bars), White Chocolate, Nutella
│   └── Decorating: Food Colors, Sprinkles, Edible Silver/Gold Foil
│
├── CANNED, PACKAGED & READY FOODS
│   ├── Canned: Tomato Puree, Coconut Milk, Chickpeas (Canned), Sweetcorn (Canned),
│   │           Tuna (Canned), Mushrooms (Canned)
│   ├── Packaged: Instant Oats, Muesli, Cornflakes, Ready-to-Cook Dal, Poha Mix
│   └── Frozen: Frozen Peas, Frozen Corn, Frozen Paratha, Frozen Veg Mix
│
├── UPWAS / FASTING SPECIAL
│   ├── Flours: Rajgira Atta (Amaranth), Singhara Atta (Water Chestnut), Kuttu Atta (Buckwheat)
│   ├── Grains: Sabudana, Sama Rice (Barnyard Millet), Rajgira Puffs
│   ├── Sweeteners: Mishri, Sendha Namak (Rock Salt — only salt for Upwas)
│   └── Spices: Jeera, Green Chilli (fresh), Ginger, Cardamom (all Upwas-safe)
│
└── HYGIENE & KITCHEN ESSENTIALS (Non-food, for tracking)
    ├── Cleaning: Dish Soap, Scrub, Sponge
    └── Packaging: Cling Film, Zip Lock Bags, Aluminium Foil, Baking Paper
```

### Python Seed Script Structure

```python
# backend/data_seed/master_items_seed.py

MASTER_ITEMS = [
    {
        "name": "Basmati Rice",
        "aliases": ["Basmati", "Long Grain Rice"],
        "category": "GRAINS_CEREALS",
        "sub_category": "Rice",
        "default_unit": "kg",
        "avg_shelf_life_days": 365,
        "storage_tip": "Store in airtight container in cool, dry place. Avoid moisture.",
        "nutrition_per_100g": {
            "calories": 356, "protein": 7.5, "carbs": 78.2,
            "fat": 0.4, "fiber": 1.0,
            "vitamins": ["B1", "B3", "B6"]
        },
        "diet_tags": ["veg", "jain", "vegan", "upwas_safe_false"],
        "allergen_tags": [],
        "is_perishable": False,
        "hindi_name": "बासमती चावल",
        "gujarati_name": "બાસમતી ચોખા"
    },
    # ... 500+ items following this structure
]

def seed_master_items():
    from pymongo import MongoClient
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB]
    collection = db["master_items"]
    collection.create_index("name", unique=True)
    collection.create_index("category")
    collection.create_index("diet_tags")
    collection.create_index("allergen_tags")
    result = collection.insert_many(MASTER_ITEMS)
    print(f"Seeded {len(result.inserted_ids)} master items.")
```

---

## 9. Backend API Design (Django REST Framework)

### Base URL
```
Production:  https://api.pantrytoplate.app/api/v1/
Development: http://localhost:8000/api/v1/
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

### Module APIs

#### Auth Module `/auth/`
```
POST   /auth/register/            → Admin registration
POST   /auth/login/               → Login (returns access + refresh tokens)
POST   /auth/refresh/             → Refresh access token
POST   /auth/logout/              → Invalidate refresh token
POST   /auth/verify-email/        → Email verification
POST   /auth/forgot-password/     → Send reset email
POST   /auth/reset-password/      → Reset with OTP/token
POST   /auth/member-join/         → Member join with invite code
GET    /auth/me/                  → Get current user profile
PATCH  /auth/me/                  → Update profile
POST   /auth/google/              → Google OAuth callback
```

#### Kitchen Module `/kitchen/`
```
POST   /kitchen/create/           → Admin creates kitchen
GET    /kitchen/                  → Get current kitchen details
PATCH  /kitchen/settings/         → Update kitchen settings
POST   /kitchen/invite/           → Generate/send invite code
GET    /kitchen/members/          → List all members
PATCH  /kitchen/members/{id}/     → Update member role/permissions
DELETE /kitchen/members/{id}/     → Remove member
POST   /kitchen/members/{id}/revoke/ → Revoke access
```

#### Pantry Module `/pantry/`
```
GET    /pantry/items/             → List all pantry items (with filters: category, expiry, status)
POST   /pantry/items/             → Add new item
GET    /pantry/items/{id}/        → Get single item
PATCH  /pantry/items/{id}/        → Update item
DELETE /pantry/items/{id}/        → Delete item
POST   /pantry/items/bulk-add/    → Bulk add items
GET    /pantry/categories/        → List all categories with counts
GET    /pantry/search/            → Search across master items for autocomplete
GET    /pantry/expiring-soon/     → Items expiring in next N days
GET    /pantry/history/           → Pantry change history log
POST   /pantry/items/{id}/photo/  → Upload item photo
```

#### To-Buy List Module `/buylist/`
```
GET    /buylist/                  → Get current to-buy list
POST   /buylist/items/            → Add item to buy list
PATCH  /buylist/items/{id}/       → Update item (qty, assigned_to, note)
DELETE /buylist/items/{id}/       → Remove from list
POST   /buylist/items/{id}/check/ → Mark as purchased (optionally add to pantry)
POST   /buylist/clear-purchased/  → Clear all purchased items
GET    /buylist/history/          → Past shopping trips
GET    /buylist/smart-suggest/    → AI-suggested items to add
POST   /buylist/share/            → Generate shareable link
```

#### AI Module `/ai/`
```
POST   /ai/suggest-meals/         → Get meal suggestions from pantry
POST   /ai/plan-3-course/         → Generate 3-course meal plan
POST   /ai/weekly-plan/           → Generate weekly meal plan
POST   /ai/ingredient-substitute/ → Suggest substitute for missing ingredient
POST   /ai/feedback/              → Submit feedback on suggestion (liked/disliked)
GET    /ai/meal-history/          → View past AI-suggested and accepted meals
```

#### Recipe Module `/recipes/`
```
GET    /recipes/                  → List recipes (filter: course, diet, cuisine, difficulty)
GET    /recipes/{id}/             → Get recipe detail
GET    /recipes/by-pantry/        → Recipes I can make with current pantry
GET    /recipes/community/        → Community recipes feed
POST   /recipes/community/        → Admin posts a community recipe
PATCH  /recipes/community/{id}/   → Edit own community recipe
DELETE /recipes/community/{id}/   → Delete own community recipe
POST   /recipes/{id}/rate/        → Rate a recipe (1-5 stars)
POST   /recipes/{id}/save/        → Save to personal cookbook
GET    /recipes/saved/            → My saved recipes
POST   /recipes/{id}/report/      → Report inappropriate recipe
```

#### Meal Plan Module `/mealplans/`
```
GET    /mealplans/today/          → Today's meal plan
POST   /mealplans/today/          → Set today's meal plan
GET    /mealplans/week/           → This week's meal plan
GET    /mealplans/history/        → Past meal plans
POST   /mealplans/broadcast/      → Admin broadcasts today's plan to family chat
```

#### Alerts Module `/alerts/`
```
GET    /alerts/                   → All active alerts (admin only)
PATCH  /alerts/{id}/read/         → Mark as read
PATCH  /alerts/{id}/dismiss/      → Dismiss alert
GET    /alerts/summary/           → Summary: count by severity
POST   /alerts/settings/          → Update alert thresholds
```

#### Analytics Module `/analytics/`
```
GET    /analytics/pantry-health/  → Pantry health score
GET    /analytics/most-used/      → Most used ingredients (date range)
GET    /analytics/waste-report/   → Food waste report
GET    /analytics/shopping/       → Shopping frequency & cost report
GET    /analytics/meals-made/     → Most cooked dishes
GET    /analytics/member-activity/→ Member engagement stats
GET    /analytics/dairy-tracker/  → Dairy items usage report
GET    /analytics/budget/         → Budget estimation report
```

#### Chat Module `/chat/` (HTTP endpoints; real-time via WebSocket)
```
GET    /chat/messages/            → Fetch message history (paginated)
GET    /chat/polls/               → List active polls
POST   /chat/polls/               → Create a new poll
POST   /chat/polls/{id}/vote/     → Cast a vote
GET    /chat/polls/{id}/results/  → Poll results
```

#### Dietary Profiles `/dietary/`
```
GET    /dietary/                  → Get all member dietary profiles
PATCH  /dietary/{user_id}/        → Update member's dietary profile (admin only for others)
GET    /dietary/restricted-items/ → List of restricted items for kitchen
POST   /dietary/restricted-items/ → Add to restricted list
DELETE /dietary/restricted-items/{id}/ → Remove from restricted list
```

---

## 10. AI/ML Module Design

### 10.1 Architecture Overview

The AI/ML system has three main components:

```
AI Engine
├── 1. Meal Suggestion Engine (content-based + collaborative filtering)
├── 2. Expiry & Waste Prediction Model
└── 3. Smart Grocery Suggestion Model
```

### 10.2 Meal Suggestion Engine

**Approach: Hybrid Recommendation System**

```python
# backend/ai/meal_suggester.py

class MealSuggestionEngine:
    """
    Combines:
    - Content-Based Filtering: Match pantry items to recipe ingredients
    - Collaborative Filtering: Learn from family's past accepted meals
    - Constraint Filtering: Apply dietary rules, allergies, restrictions
    - Freshness Weighting: Boost recipes using near-expiry items
    """

    def suggest(self, kitchen_id: str, num_suggestions: int = 5) -> list:
        # Step 1: Get pantry items
        pantry = self.get_pantry(kitchen_id)
        
        # Step 2: Get dietary constraints
        constraints = self.get_constraints(kitchen_id)
        
        # Step 3: Filter recipes that respect constraints
        eligible_recipes = self.filter_by_constraints(constraints)
        
        # Step 4: Score recipes by ingredient availability
        scored = self.score_by_availability(pantry, eligible_recipes)
        
        # Step 5: Apply freshness boost
        boosted = self.apply_freshness_boost(pantry, scored)
        
        # Step 6: Apply collaborative filter (user preference history)
        personalized = self.apply_collaborative_filter(kitchen_id, boosted)
        
        # Step 7: Return top N with explanation
        return self.format_suggestions(personalized[:num_suggestions], pantry)

    def score_by_availability(self, pantry, recipes):
        """
        Score = (available_required_ingredients / total_required_ingredients) * 100
        Bonus: +10 if all ingredients available, -20 if key ingredient missing
        """
        pantry_set = {item['master_item_id'] for item in pantry}
        scored = []
        for recipe in recipes:
            required = [i for i in recipe['ingredients'] if not i['is_optional']]
            available_count = sum(1 for i in required if i['master_item_id'] in pantry_set)
            score = (available_count / len(required)) * 100 if required else 0
            scored.append({**recipe, 'availability_score': score,
                           'missing_ingredients': [i for i in required
                                                   if i['master_item_id'] not in pantry_set]})
        return sorted(scored, key=lambda x: x['availability_score'], reverse=True)

    def apply_freshness_boost(self, pantry, scored_recipes):
        """Boost recipes that use items expiring in next 3 days."""
        expiring_ids = {item['master_item_id'] for item in pantry
                       if item.get('expiry_date') and
                       (item['expiry_date'] - date.today()).days <= 3}
        for recipe in scored_recipes:
            uses_expiring = any(i['master_item_id'] in expiring_ids
                               for i in recipe['ingredients'])
            if uses_expiring:
                recipe['availability_score'] += 15
                recipe['freshness_boost'] = True
        return sorted(scored_recipes, key=lambda x: x['availability_score'], reverse=True)
```

### 10.3 Deep Learning Model (TensorFlow/Keras)

Used for learning family preferences over time.

```python
# backend/ai/preference_model.py

"""
Model: Neural Collaborative Filtering
Input: [kitchen_id_embedding, recipe_id_embedding]
Output: Preference score (0–1)
Training: Admin's accepted/rejected meal suggestions (feedback loop)
"""

import tensorflow as tf

def build_ncf_model(num_kitchens, num_recipes, embedding_dim=32):
    kitchen_input = tf.keras.Input(shape=(1,), name='kitchen_id')
    recipe_input = tf.keras.Input(shape=(1,), name='recipe_id')
    
    kitchen_emb = tf.keras.layers.Embedding(num_kitchens, embedding_dim)(kitchen_input)
    recipe_emb = tf.keras.layers.Embedding(num_recipes, embedding_dim)(recipe_input)
    
    kitchen_flat = tf.keras.layers.Flatten()(kitchen_emb)
    recipe_flat = tf.keras.layers.Flatten()(recipe_emb)
    
    concat = tf.keras.layers.Concatenate()([kitchen_flat, recipe_flat])
    dense1 = tf.keras.layers.Dense(64, activation='relu')(concat)
    dense2 = tf.keras.layers.Dense(32, activation='relu')(dense1)
    output = tf.keras.layers.Dense(1, activation='sigmoid')(dense2)
    
    model = tf.keras.Model(inputs=[kitchen_input, recipe_input], outputs=output)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model
```

### 10.4 Expiry & Waste Prediction

```python
# backend/ai/waste_predictor.py

"""
Uses Random Forest classifier to predict:
- Probability of an item being wasted (not used before expiry)
- Based on: category, avg shelf life, past usage patterns, seasonal trends

Output used for:
- Prioritizing items in meal suggestions
- Generating alerts before waste happens
"""
```

### 10.5 Smart Grocery Predictor

```python
# backend/ai/grocery_predictor.py

"""
Uses time-series forecasting (simple LSTM) to predict:
- Which items will run out in next N days
- Based on: consumption history, household size, past purchase frequency

Output used for:
- Auto-populating To-Buy list
- Sending restock alerts
"""
```

---

## 11. Frontend Architecture (React)

### 11.1 Project Structure

```
frontend/
├── public/
│   └── assets/                  ← Static images, fonts
├── src/
│   ├── components/
│   │   ├── common/              ← Buttons, Inputs, Modals, Cards, Badges
│   │   ├── layout/              ← Navbar, Sidebar, Footer, PageWrapper
│   │   ├── pantry/              ← PantryTable, ItemCard, AddItemModal
│   │   ├── recipes/             ← RecipeCard, RecipeDetail, StepList
│   │   ├── chat/                ← ChatWindow, MessageBubble, PollCard
│   │   ├── alerts/              ← AlertBanner, AlertCenter, AlertBadge
│   │   ├── analytics/           ← Charts, ReportCard, HealthScore
│   │   ├── ai/                  ← SuggestionCard, MealPlanCard, 3CourseView
│   │   └── family/              ← MemberCard, InviteModal, DietBadge
│   ├── pages/
│   │   ├── landing/             ← LandingPage, PricingPage, AboutPage
│   │   ├── auth/                ← Login, Register, ResetPassword, MemberJoin
│   │   ├── admin/               ← Dashboard, PantryPage, AnalyticsPage
│   │   ├── member/              ← MemberDashboard, PantryView
│   │   ├── recipes/             ← RecipeLibrary, CommunityPage, MyRecipes
│   │   ├── chat/                ← FamilyChatPage
│   │   ├── buylist/             ← ToBuyPage
│   │   └── settings/            ← KitchenSettings, DietarySettings, ProfilePage
│   ├── store/
│   │   ├── authStore.js         ← Zustand: user, token, role
│   │   ├── pantryStore.js       ← Zustand: items, categories, filters
│   │   ├── alertStore.js        ← Zustand: active alerts count
│   │   └── chatStore.js         ← Zustand: messages, active poll
│   ├── hooks/
│   │   ├── usePantry.js
│   │   ├── useAISuggest.js
│   │   ├── useAlerts.js
│   │   ├── useChat.js           ← WebSocket hook
│   │   └── useAnalytics.js
│   ├── services/
│   │   ├── api.js               ← Axios instance with interceptors
│   │   ├── authService.js
│   │   ├── pantryService.js
│   │   ├── recipeService.js
│   │   └── chatSocket.js        ← Socket.io client
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── expiryUtils.js       ← Expiry color/badge helpers
│   │   ├── dietUtils.js         ← Diet tag helpers
│   │   └── formatUtils.js
│   ├── constants/
│   │   ├── categories.js
│   │   ├── dietTypes.js
│   │   └── routes.js
│   ├── i18n/
│   │   ├── en.json
│   │   ├── hi.json
│   │   └── gu.json
│   ├── App.jsx
│   ├── Router.jsx
│   └── main.jsx
├── .env
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### 11.2 Routing Structure

```javascript
// src/Router.jsx

const routes = [
  // Public routes
  { path: "/", component: LandingPage },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/join/:code", component: MemberJoinPage },
  { path: "/reset-password", component: ResetPasswordPage },
  
  // Protected — Admin only
  { path: "/dashboard", component: AdminDashboard, role: "admin" },
  { path: "/pantry", component: PantryPage, role: "admin" },
  { path: "/analytics", component: AnalyticsPage, role: "admin" },
  { path: "/alerts", component: AlertsPage, role: "admin" },
  { path: "/settings", component: SettingsPage, role: "admin" },
  { path: "/dietary", component: DietarySettingsPage, role: "admin" },
  
  // Protected — Admin + Member
  { path: "/buy-list", component: ToBuyPage, role: "any" },
  { path: "/recipes", component: RecipeLibraryPage, role: "any" },
  { path: "/recipes/:id", component: RecipeDetailPage, role: "any" },
  { path: "/community", component: CommunityPage, role: "any" },
  { path: "/chat", component: FamilyChatPage, role: "any" },
  { path: "/ai-suggest", component: AISuggestPage, role: "any" },
  { path: "/meal-plan", component: MealPlanPage, role: "any" },
  { path: "/profile", component: ProfilePage, role: "any" },
  
  // Member dashboard
  { path: "/home", component: MemberDashboard, role: "member" },
];
```

### 11.3 State Management (Zustand)

```javascript
// src/store/pantryStore.js
import { create } from 'zustand';

export const usePantryStore = create((set, get) => ({
  items: [],
  categories: [],
  activeCategory: 'ALL',
  searchQuery: '',
  sortBy: 'expiry',
  isLoading: false,
  
  setItems: (items) => set({ items }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  
  filteredItems: () => {
    const { items, activeCategory, searchQuery } = get();
    return items
      .filter(item => activeCategory === 'ALL' || item.category === activeCategory)
      .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  },
  
  addItem: (item) => set(state => ({ items: [...state.items, item] })),
  updateItem: (id, updates) => set(state => ({
    items: state.items.map(i => i._id === id ? { ...i, ...updates } : i)
  })),
  removeItem: (id) => set(state => ({
    items: state.items.filter(i => i._id !== id)
  })),
}));
```

---

## 12. Landing Page Design

### Sections (Top to Bottom)

#### 1. Navbar
- Logo (Pantry to Plate wordmark + fork icon)
- Nav: Features | How It Works | Community | Pricing | Blog
- CTAs: Login | Get Started (primary button)
- Mobile: Hamburger menu

#### 2. Hero Section
```
Headline: "Your Kitchen, Powered by AI."
Subline: "Manage your pantry, plan 3-course meals, 
          reduce food waste, and cook together — all in one place."
CTAs: [Get Started Free] [Watch Demo ▶]
Visual: Animated phone mockup showing pantry dashboard + meal suggestion card
Background: Glassmorphism dark kitchen aesthetic with subtle ingredient illustrations
```

#### 3. Social Proof Bar
```
"Trusted by 10,000+ families | ⭐ 4.8 Rating | 0 Food Wasted | Made for Indian Kitchens"
```

#### 4. Feature Grid (6 cards)
- 🥦 Smart Pantry Management
- 🤖 AI Meal Suggestions
- 👨‍👩‍👧 Family Collaboration
- 🛒 Smart To-Buy Lists
- 🍽️ 3-Course Meal Planner
- 📊 Kitchen Analytics

#### 5. How It Works (3 Steps Animated)
```
Step 1: Add your pantry items (with category auto-suggest)
Step 2: AI suggests meals based on what you have
Step 3: Cook together, plan together, eat happy
```

#### 6. AI Demo (Interactive)
- Live pantry input (example items) → Click "Suggest Meal" → Watch results appear
- No login required for demo

#### 7. Diet Type Support
Icons for: 🟢 Veg | 🔴 Non-Veg | 🟡 Jain | 🟠 Upwas | 🌱 Vegan | 🥗 Keto | 🌾 Gluten-Free

#### 8. Community Recipes Preview
- Scroll of 6 recipe cards from community

#### 9. Family Feature Spotlight
- Visual: Admin sending meal plan → Members see it → Family chats about it → Poll for dinner

#### 10. Pricing Plans
```
Free Plan: 1 admin, up to 3 members, basic AI suggestions, 50 pantry items
Family Plan (₹199/mo): Unlimited members, full AI, community access, analytics
Premium Plan (₹499/mo): All features + advanced ML, WhatsApp integration, priority support
```

#### 11. Testimonials Carousel

#### 12. FAQ Accordion

#### 13. Footer
- Links: About | Privacy | Terms | Blog | Contact
- Social: Instagram | Twitter | YouTube | LinkedIn
- App store badges (future)

---

## 13. Authentication & Authorization Flow

### Admin Registration Flow

```
1. User visits /register
2. Fills: Full Name, Email, Password, Family/Kitchen Name, Default Diet Type
3. Submit → POST /auth/register/ → Backend sends verification email
4. User clicks email link → Account verified
5. Redirect to /dashboard (first-time onboarding wizard)

Onboarding Wizard (5 steps):
  Step 1: Kitchen setup (name, type, timezone)
  Step 2: Invite family members (send emails)
  Step 3: Set dietary preferences & allergies
  Step 4: Add first 10 pantry items (guided)
  Step 5: Get first AI meal suggestion (wow moment!)
```

### Member Join Flow

```
1. Admin generates invite code from /settings/family
2. System sends email to member with invite link: app.pantrytoplate.app/join/ABC12345
3. Member clicks link → Pre-filled Kitchen Code → Fills Name, Email, Password
4. Account created with role = "member", linked to kitchen
5. Member redirected to /home (member dashboard)
```

### JWT Token Strategy

```python
# settings.py (DRF SimpleJWT config)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### Role-Based Permission Classes

```python
# backend/permissions.py

class IsAdminOfKitchen(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class IsMemberOfKitchen(BasePermission):
    def has_permission(self, request, view):
        return request.user.kitchen_id is not None

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.added_by == request.user.id or request.user.role == 'admin'
```

---

## 14. Admin Dashboard

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ SIDEBAR          │  MAIN CONTENT AREA                            │
│ ─────────────    │  ──────────────────────────────               │
│ 🏠 Dashboard     │  Good Morning, Sunita! ☀️                     │
│ 🥦 Pantry        │  ─────────────────────────────────────────    │
│ 🛒 Buy List      │  [Alert Banner: 3 items expiring tomorrow!]   │
│ 🤖 AI Suggest    │                                               │
│ 🍽️ Meal Plan     │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│ 📖 Recipes       │  │ Pantry   │ │ Today's  │ │  Family      │ │
│ 💬 Family Chat   │  │ Health   │ │ Meal Plan│ │  Activity    │ │
│ 📊 Analytics     │  │  Score   │ │          │ │              │ │
│ ⚙️ Settings      │  │  87/100  │ │ Breakfast│ │ Rahul added  │ │
│                  │  │  🟢 Good │ │ Lunch    │ │ 5 items      │ │
│ ─────────────    │  │          │ │ Dinner   │ │ 2 hrs ago    │ │
│ Members (4)      │  └──────────┘ └──────────┘ └──────────────┘ │
│ 🔴 Alerts (3)    │                                               │
└──────────────────┴───────────────────────────────────────────────┘
```

### Dashboard Widgets
1. **Pantry Health Score** — Gauge chart (0–100)
2. **Today's Meal Plan** — Quick card with Breakfast/Lunch/Dinner
3. **Active Alerts** — Compact list with severity icons
4. **Family Activity Feed** — Recent member actions
5. **Quick Add to Pantry** — Search box + Add button (right from dashboard)
6. **AI Suggestion Preview** — 1 top suggestion with "Plan Today's Meal" CTA
7. **To-Buy List Summary** — Count of items pending
8. **Weekly Meal Calendar** — Mini calendar view

---

## 15. Pantry Management Module

### UI Layout

```
PANTRY PAGE
──────────────────────────────────────────────────────────────
[🔍 Search items...]    [+ Add Item]   [📤 Import CSV]   [Filter ▼]

CATEGORIES:  [All (147)] [🥕 Vegetables (23)] [🌾 Grains (18)] [🥛 Dairy (12)] ...

──────────────────────────────────────────────────────────────
ITEM LIST (Card/Table toggle):

[ 🥛 Milk (Full Fat)      | 2 L   | Fridge  | Exp: Tomorrow ⚠️ | Edit | Delete ]
[ 🌾 Basmati Rice         | 3 kg  | Shelf   | Exp: 6 months  ✅ | Edit | Delete ]
[ 🍅 Tomato               | 500 g | Counter | Exp: 2 days    🟡 | Edit | Delete ]
```

### Add Item Modal

```
ADD PANTRY ITEM
──────────────────────────────────
Search Item Name: [___________] ← Autocomplete from master DB
Category: (auto-filled)
Quantity: [___] Unit: [kg ▼]
Purchase Date: [📅]
Expiry Date: [📅] (optional)
Storage Location: [Fridge ▼]
Brand (optional): [___________]
Notes (optional): [___________]
                    [Cancel] [Add Item]
```

### Expiry Color System

| Status | Color | Days Remaining |
|---|---|---|
| Fresh | 🟢 Green | > 7 days |
| Expiring Soon | 🟡 Yellow | 4–7 days |
| Expiring Very Soon | 🟠 Orange | 1–3 days |
| Expires Today | 🔴 Red | 0 days |
| Expired | ⬛ Grey | < 0 days |

### Quick Edit (Inline)
Clicking Edit opens an inline edit row — no modal needed. Update quantity or date without leaving the list.

### Bulk Add via CSV
Format:
```csv
name,quantity,unit,expiry_date,storage_location
Spinach,250,g,2024-12-05,Fridge
Rice,5,kg,,Shelf
```

---

## 16. To-Buy List Module

### UI

```
TO-BUY LIST
──────────────────────────────────────────────────────────────
[+ Add Item]    [🔗 Share List]    [✅ Clear Purchased]

SMART SUGGESTIONS (AI): [+ Tomatoes (Running Low)] [+ Curd (Usually bought weekly)]

──────────────────────────────────────────────────────────────
PENDING (8 items)                    PURCHASED (3 items)

☐ 🥛 Milk             2 L    → Rahul    ✏️ 🗑️
☐ 🍅 Tomato           1 kg   → Sunita   ✏️ 🗑️
☐ 🌿 Coriander        1 bunch→ Anyone   ✏️ 🗑️
...

─────────────────────────────────────────────────────────────
☑ ✓ Bread              1 loaf  → Purchased 2h ago
☑ ✓ Eggs               12 pcs  → Purchased 2h ago
```

### Smart Features
- **Auto-add from Meal Plan**: When admin plans a meal, missing ingredients auto-added to buy list
- **Assignment**: Each item assignable to a family member
- **Check-off Flow**: Checking off item prompts "Add to Pantry?" with quantity pre-filled

---

## 17. Family Integration Module

### Invite Flow (Admin Side)

```
FAMILY MEMBERS
──────────────────────────────────────────────────────────────
Kitchen Code: ABC12345  [📋 Copy] [🔄 Regenerate]
                        [📧 Send Invites]

Members (4/10):
┌─────────────────────────────────────────────────────────┐
│ 👤 Sunita (You)    Admin     🟢 Active                  │
│ 👤 Rahul           Member    🟢 Active     [Manage ▼]   │
│ 👤 Priya (Sister)  Member    🟡 Pending    [Resend ▼]   │
│ 👤 Ajay            Member    🔴 Inactive   [Remove]     │
└─────────────────────────────────────────────────────────┘

[+ Invite New Member]
```

### Member Permissions Matrix

| Feature | Admin | Full Member | View Only |
|---|---|---|---|
| View Pantry | ✅ | ✅ | ✅ |
| Add Pantry Item | ✅ | ✅ | ❌ |
| Edit Pantry Item | ✅ | ✅ | ❌ |
| Delete Pantry Item | ✅ | ✅ | ❌ |
| View Buy List | ✅ | ✅ | ✅ |
| Update Buy List | ✅ | ✅ | ❌ |
| View Recipes | ✅ | ✅ | ✅ |
| Post Community Recipe | ✅ | ✅ | ❌ |
| Chat | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ❌ | ❌ |
| Manage Members | ✅ | ❌ | ❌ |
| Change Dietary Settings | ✅ | ❌ | ❌ |

---

## 18. Family Chat & Communication Module

### Real-Time Architecture (Django Channels)

```python
# backend/chat/consumers.py

class KitchenChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.kitchen_id = self.scope['url_route']['kwargs']['kitchen_id']
        self.room_group_name = f"kitchen_{self.kitchen_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'text')
        
        # Save to DB
        message = await self.save_message(data)
        
        # Broadcast to all kitchen members
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'chat_message',
            'message': message
        })
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))
```

### Message Types & UI

| Type | Appearance |
|---|---|
| Text | Standard chat bubble with sender name + time |
| Meal Card | Rich card with dish name, photo, recipe link |
| Poll | Question with option buttons + live vote count |
| Recipe Share | Mini recipe card with thumbnail + "View Recipe" |
| Reminder | Banner-style with bell icon + time |
| Image | Full-width food photo |

### Daily Meal Broadcast
Admin selects today's meal plan → clicks "Send to Family" → Meal Card appears in chat for all members → Members can react with 👍❤️😋

### Poll System
```
🗳️ POLL: What for dinner tonight?
──────────────────────────────────
○ Dal Tadka + Rice      ▓▓▓▓▓░ 60% (3 votes)
○ Pav Bhaji             ▓▓░░░░ 40% (2 votes)
○ Pasta                 ░░░░░░  0% (0 votes)
Ends in: 4h 32m         [Vote]
```

---

## 19. Food Alerts & Notifications Module

### Alert Types & Triggers

```python
# backend/alerts/triggers.py

ALERT_RULES = {
    "EXPIRY_CRITICAL": {
        "condition": "days_to_expiry <= 1",
        "severity": "critical",
        "message": "{item_name} expires {today/tomorrow}! Use it now.",
        "icon": "🔴"
    },
    "EXPIRY_WARNING": {
        "condition": "1 < days_to_expiry <= 3",
        "severity": "warning",
        "message": "{item_name} expiring in {days} days.",
        "icon": "🟡"
    },
    "LOW_STOCK": {
        "condition": "quantity <= low_stock_threshold",
        "severity": "warning",
        "message": "{item_name} is running low ({quantity} {unit} left).",
        "icon": "📉"
    },
    "DAIRY_FRESHNESS": {
        "condition": "category == DAIRY and days_since_purchase >= 3 and no expiry set",
        "severity": "info",
        "message": "Check freshness of {item_name} — purchased {days} days ago.",
        "icon": "🥛"
    },
    "FROZEN_DURATION": {
        "condition": "storage_location == freezer and days_since_purchase > 90",
        "severity": "warning",
        "message": "{item_name} has been frozen for over 90 days. Quality may be affected.",
        "icon": "🧊"
    }
}
```

### Alert Center UI

```
ALERT CENTER
──────────────────────────────────────────────────────────────
CRITICAL (2)   WARNING (5)   INFO (3)   [Mark All Read]

🔴 [CRITICAL] Milk expires TODAY → [Use It]  [Dismiss]
🔴 [CRITICAL] Paneer expires TOMORROW → [Use It]  [Dismiss]
🟡 [WARNING]  Spinach expiring in 2 days → [Plan Meal]  [Dismiss]
🟡 [WARNING]  Tomatoes running low (200g) → [Add to Buy List]
ℹ️ [INFO]     Curd purchased 3 days ago — check freshness
```

### Celery Scheduled Tasks

```python
# backend/celery_tasks/alert_tasks.py

@app.task
def run_daily_expiry_check():
    """Runs every morning at 7 AM. Checks all kitchens."""
    for kitchen in Kitchen.objects.filter(is_active=True):
        pantry_items = PantryItem.objects.filter(kitchen_id=kitchen.id)
        for item in pantry_items:
            check_and_create_alert(item, kitchen)

@app.task
def send_alert_notifications():
    """Runs every morning at 8 AM. Sends email/push for new alerts."""
    new_alerts = Alert.objects.filter(is_notified=False, severity__in=['critical', 'warning'])
    for alert in new_alerts:
        send_alert_email(alert)
        send_push_notification(alert)
        alert.is_notified = True
        alert.save()
```

---

## 20. Dietary Preferences & Allergy Management

### Diet Type Definitions

```python
DIET_TYPES = {
    "VEGETARIAN": {
        "label": "Vegetarian",
        "icon": "🟢",
        "excludes": ["meat", "poultry", "fish", "seafood"],
        "includes_eggs": True,
        "includes_dairy": True
    },
    "VEGAN": {
        "label": "Vegan",
        "icon": "🌱",
        "excludes": ["meat", "poultry", "fish", "seafood", "dairy", "eggs", "honey"]
    },
    "JAIN": {
        "label": "Jain",
        "icon": "☮️",
        "excludes": ["meat", "poultry", "fish", "seafood", "eggs",
                     "root_vegetables"],  # Onion, Garlic, Potato, Carrot, Beet
        "note": "No root vegetables, no eating after sunset (optional)"
    },
    "UPWAS": {
        "label": "Upwas (Fasting)",
        "icon": "🙏",
        "includes_only": ["fruits", "dairy", "sabudana", "rajgira", "kuttu",
                          "singhara", "sama_rice", "sendha_namak", "green_chilli",
                          "ginger", "coconut", "peanuts", "sweet_potato"]
    },
    "NON_VEG": {
        "label": "Non-Vegetarian",
        "icon": "🔴",
        "includes_all": True
    },
    "EGGETARIAN": {
        "label": "Eggetarian",
        "icon": "🥚",
        "excludes": ["meat", "poultry", "fish", "seafood"],
        "includes_eggs": True
    },
    "KETO": {
        "label": "Keto",
        "icon": "🥑",
        "max_carbs_per_meal_g": 20,
        "focuses_on": ["proteins", "healthy_fats"],
        "excludes": ["rice", "wheat", "sugar", "most_fruits"]
    },
    "GLUTEN_FREE": {
        "label": "Gluten-Free",
        "icon": "🌾❌",
        "excludes": ["wheat", "barley", "rye", "oats_unless_certified"]
    }
}
```

### Allergy Warning System

When AI suggests a recipe, system cross-checks all active household member allergy profiles. Recipe card displays:

```
Recipe: Paneer Butter Masala

✅ Safe for: Sunita (Admin), Rahul, Priya
⚠️  Ajay is LACTOSE INTOLERANT — contains dairy (Paneer, Butter, Cream)
    [Make Separate Vegan Version?]
```

---

## 21. Recipe & Community Module

### Recipe Card Component

```
┌─────────────────────────────────────────────┐
│ [Thumbnail Image]                           │
│                                             │
│ Dal Tadka                      🟢 Veg       │
│ ⭐ 4.7 (234)  |  ⏱ 30 mins  |  👥 4 serves│
│                                             │
│ You have: ████████░░ 8/10 ingredients       │
│ Missing: Kasuri Methi, Jeera                │
│                                             │
│ [View Recipe]  [Add Missing to Buy List]    │
└─────────────────────────────────────────────┘
```

### Recipe Detail Page

```
DAL TADKA
─────────────────────────────────────────────────────
🟢 Vegetarian | ⭐ 4.7 | ⏱ 30 mins | 🍽️ Serves 4
Cuisines: North Indian | Difficulty: Easy

📹 [YouTube Tutorial: "Perfect Dal Tadka - Hebbar's Kitchen"]

NUTRITIONAL INFO (per serving): 280 cal | 14g protein | 42g carbs | 6g fat

INGREDIENTS:                     AVAILABILITY:
──────────────────────────────────────────────
✅ Arhar Dal          200g       In Pantry (300g)
✅ Onion              1 large    In Pantry
✅ Tomato             2          In Pantry (3)
✅ Garlic             4 cloves   In Pantry
✅ Cumin Seeds        1 tsp      In Pantry
✅ Turmeric           ½ tsp      In Pantry
✅ Red Chilli Powder  1 tsp      In Pantry
✅ Coriander Powder   1 tsp      In Pantry
❌ Kasuri Methi       1 tbsp     NOT in Pantry  [+ Add to Buy List]
✅ Oil/Ghee           2 tbsp     In Pantry
✅ Salt               to taste   In Pantry

STEPS:
─────────────────────────────────────────────────────
Step 1: Wash and soak dal for 30 minutes...
Step 2: Pressure cook with water, turmeric and salt...
Step 3: Prepare tadka — heat ghee, add cumin seeds...
...
```

### Community Features

```
COMMUNITY RECIPES
─────────────────────────────────────────────────────
[🔍 Search]  [Filter: Diet ▼] [Sort: Popular ▼]  [+ Share My Recipe]

TRENDING THIS WEEK:
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Maa Ki Dal   │ │ Instant Pot  │ │ No-Bake      │
│ by @Sunita_G │ │ Rajma        │ │ Ladoo        │
│ ❤️ 342 saves │ │ ❤️ 289 saves │ │ ❤️ 198 saves │
│ #NorthIndian │ │ #QuickMeal   │ │ #Dessert     │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 22. AI Food Suggestion Engine

### Response Format (API)

```json
{
  "suggestions": [
    {
      "recipe_id": "ObjectId",
      "name": "Palak Dal",
      "reason": "Uses expiring spinach (1 day left) + available arhar dal",
      "availability_score": 95,
      "freshness_boost": true,
      "missing_count": 1,
      "missing_items": [{ "name": "Kasoori Methi", "quantity": "1 tbsp" }],
      "diet_safe_for": ["Sunita", "Rahul", "Priya"],
      "warnings": [],
      "course": "main",
      "cook_time_mins": 30,
      "difficulty": "easy",
      "thumbnail_url": "...",
      "youtube_link": "..."
    }
  ],
  "pantry_health": 87,
  "expiring_items_used": 2,
  "total_suggestions": 5,
  "generated_at": "2024-12-10T07:30:00Z"
}
```

### Suggestion Card UI

```
🤖 AI Meal Suggestions for Today
─────────────────────────────────────────────────────
Based on your pantry: 147 items | ⚠️ 3 items expiring soon

┌──────────────────────────────────────────────────┐
│ #1 PALAK DAL                      🌿 Freshness+  │
│ "Uses expiring spinach & arhar dal"               │
│ ✅ 95% ingredients available | ⏱ 30 mins         │
│ 🟢 Safe for all 4 family members                  │
│ Missing: Kasuri Methi (1 tbsp)  [+Buy]           │
│          [🍽️ Plan This Meal]  [▶ View Recipe]    │
└──────────────────────────────────────────────────┘
[👎 Not Today]  [🔄 Show More Options]
```

---

## 23. 3-Course Meal Planner

### UI

```
3-COURSE MEAL PLANNER
─────────────────────────────────────────────────────
[🤖 Generate from Pantry]    [🎉 Festival Mode: Select ▼]

TODAY'S MENU — Thursday, 10 December 2024

🥗 STARTER
┌──────────────────────────────────────────┐
│ Tomato Shorba (Soup)                     │
│ ⏱ 15 min | 🟢 Veg | 98% available       │
│ [Change Starter ▼]                       │
└──────────────────────────────────────────┘

🍽️ MAIN COURSE
┌──────────────────────────────────────────┐
│ Palak Paneer + Jeera Rice + Roti         │
│ ⏱ 45 min | 🟢 Veg | 90% available       │
│ [Change Main ▼]                          │
└──────────────────────────────────────────┘

🍮 DESSERT
┌──────────────────────────────────────────┐
│ Gajar Halwa                              │
│ ⏱ 30 min | 🟢 Veg | 95% available       │
│ [Change Dessert ▼]                       │
└──────────────────────────────────────────┘

COMBINED NUTRITION: 850 cal | 28g protein | Balanced ✅

[📢 Send to Family]  [🖨️ Print Menu]  [✅ Save as Today's Plan]
```

### Festival Meal Plans
Pre-built templates for:
- Diwali (Besan Ladoo, Kaju Katli, Chakli)
- Navratri/Upwas (Sabudana Khichdi, Singhara Halwa, Fruits)
- Makar Sankranti (Tilgul Ladoo, Undhiyu)
- Holi (Thandai, Gujia, Dahi Bhalle)
- Eid (Biryani, Sheer Khurma)
- Christmas (Plum Cake, Roast)

---

## 24. Admin Analytics & Progress Reports

### Reports Available

#### Pantry Health Report
- Total items, fresh vs expiring vs expired breakdown
- Health score (0–100) with trend over last 30 days
- Most expired categories (helps admin improve buying habits)

#### Food Waste Report
- Items deleted as "expired/unused" over time
- Cost estimate of wasted food
- Trend: Improving / Worsening

#### Most Used Ingredients (Bar Chart)
- Top 15 ingredients by usage frequency
- Weekly vs monthly toggle
- Useful for planning bulk buying

#### Most Cooked Dishes (Admin Logs)
- Admin manually logs meals made OR marks AI suggestions as made
- Ranked list with times cooked

#### Shopping Frequency
- Average days between shopping trips
- Average items per trip
- Estimated spend per trip (user inputs prices optionally)

#### Dairy Tracker
- Daily log of milk/curd/paneer usage
- Average consumption per week
- Helps estimate purchase quantity

#### Member Activity
- Who adds pantry items most
- Who uses recipes most
- Who completes buy-list tasks

#### Budget Estimation
- Monthly grocery estimate based on item categories and average prices
- Actual vs estimated (if user enters purchase amounts)

---

## 25. Member Dashboard

A simplified, clean view for non-admin family members.

```
MEMBER DASHBOARD — Welcome, Rahul! 👋

TODAY'S MEAL PLAN (From Sunita):
─────────────────────────────────────
🌅 Breakfast: Poha with Peanuts
☀️ Lunch:     Dal Chawal + Sabzi
🌙 Dinner:    [Poll is active — Vote now!]

─────────────────────────────────────
QUICK ACCESS:
[🥦 Pantry]  [🛒 Buy List]  [📖 Recipes]  [💬 Chat]

─────────────────────────────────────
FAMILY CHAT (3 new messages)
─────────────────────────────────────
PANTRY QUICK UPDATE:
[+ Add Item I Bought]
```

---

## 26. UI/UX Design System

### Color Palette

```css
/* Primary: Warm Green (Food, Fresh, Natural) */
--color-primary:       #3D9970;   /* Deep Green */
--color-primary-light: #6BBF95;   /* Soft Green */
--color-primary-dark:  #2A7A55;   /* Forest Green */

/* Accent: Warm Amber (Food, Spice, Energy) */
--color-accent:        #F0A500;   /* Amber */
--color-accent-light:  #FFD166;   /* Warm Yellow */
--color-accent-dark:   #C07800;   /* Deep Amber */

/* Background: Deep Glassmorphism */
--color-bg-dark:       #0F1C1A;   /* Deep Dark Green-Black */
--color-bg-card:       rgba(255,255,255,0.05); /* Glass Card */
--color-bg-card-hover: rgba(255,255,255,0.10);

/* Neutrals */
--color-text-primary:  #F0EDE8;   /* Warm White */
--color-text-secondary:#B0ADA8;   /* Muted Warm */
--color-border:        rgba(255,255,255,0.12);

/* Semantic */
--color-success:       #4CAF50;
--color-warning:       #FFC107;
--color-danger:        #F44336;
--color-info:          #2196F3;

/* Expiry Status Colors */
--expiry-fresh:        #4CAF50;
--expiry-soon:         #FFC107;
--expiry-urgent:       #FF7043;
--expiry-today:        #F44336;
--expiry-expired:      #9E9E9E;
```

### Typography

```css
--font-display: 'Playfair Display', serif;   /* Hero headlines */
--font-sans:    'Inter', sans-serif;          /* Body text, UI */
--font-mono:    'JetBrains Mono', monospace;  /* Code, quantities */

/* Scale */
--text-xs:   0.75rem;   /* 12px — Labels */
--text-sm:   0.875rem;  /* 14px — Secondary text */
--text-base: 1rem;      /* 16px — Body */
--text-lg:   1.125rem;  /* 18px — Card titles */
--text-xl:   1.25rem;   /* 20px — Section titles */
--text-2xl:  1.5rem;    /* 24px — Page titles */
--text-3xl:  1.875rem;  /* 30px — Hero sub */
--text-4xl:  2.25rem;   /* 36px — Hero headline */
```

### Glassmorphism Card Style

```css
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(61, 153, 112, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
```

### Component Library Conventions

- **Buttons**: Rounded-full for CTAs, rounded-lg for form actions
- **Inputs**: Glass background, visible focus ring with primary color
- **Badges**: Small, pill-shaped, color-coded by category/diet type
- **Modals**: Centered glass card with blurred backdrop
- **Alerts**: Left-border colored strip
- **Loading States**: Skeleton screens (not spinners) for content
- **Empty States**: Illustrated with actionable CTA
- **Animations**: Framer Motion for page transitions, item additions

### Responsive Breakpoints

```javascript
// tailwind.config.js
screens: {
  'sm':  '640px',   // Mobile landscape
  'md':  '768px',   // Tablet
  'lg':  '1024px',  // Laptop
  'xl':  '1280px',  // Desktop
  '2xl': '1536px',  // Large desktop
}
```

---

## 27. Advanced / Next-Level Features

### 27.1 Smart Receipt Scanner
- Upload grocery receipt photo → OCR reads items + quantities → Auto-adds to pantry
- Uses Tesseract OCR + custom NLP to parse Indian receipt formats
- Supports both English and Hindi/Gujarati receipts

### 27.2 Barcode Scanner (Mobile PWA)
- Scan product barcode → Lookup in product database → Auto-fill item details
- Integrates with Open Food Facts API for product info
- Offline mode: scan locally, sync when online

### 27.3 WhatsApp Integration
- Admin sends daily meal plan directly to family WhatsApp group via WhatsApp Business API
- Expiry alerts sent to admin's WhatsApp
- Members can reply "Add milk to buy list" via WhatsApp

### 27.4 Voice Assistant (Future)
- "Hey Plate, what can I cook with what I have?"
- "Add 2 kg tomatoes to my pantry"
- "What's expiring this week?"
- Web Speech API + custom NLP intent parser

### 27.5 Calorie & Nutrition Tracker
- Daily intake based on meals planned/cooked
- Per-family-member tracking with goals
- Deficiency alerts ("Rahul's diet is low in Protein this week")
- Weekly nutrition report

### 27.6 Seasonal & Festival Meal Calendar
- Automatic suggestions based on time of year
- "It's Makar Sankranti — here are traditional recipes you can make!"
- Festival-specific pantry alerts ("You'll need jaggery for Sankranti")

### 27.7 AI Chef — Natural Language Interface
- Chat interface: "I want to make something quick with potatoes and curd"
- AI understands context → suggests Dahi Aloo or Dum Aloo
- Multi-turn conversation ("Something spicier?" → refines suggestions)
- Powered by Anthropic/OpenAI API integration

### 27.8 Grocery Store Integration (Partnership API)
- Connect to BigBasket, Blinkit, Zepto via their affiliate APIs
- One-click "Order from Buy List" → Auto-fills cart on selected app
- Price comparison across stores

### 27.9 Meal Subscription Sharing
- Families can export their weekly meal plan as a PDF
- Share on social (with a beautiful template design)
- "What's cooking in 10,000 Indian kitchens this week?" aggregated stats

### 27.10 Guest Kitchen Mode
- Temporary guest access (72-hour link) for visiting relatives
- Guest can view pantry and recipes, suggest meals
- Automatically expires

### 27.11 Progressive Web App (PWA)
- Install on mobile home screen
- Offline mode: View pantry, check recipes (read-only)
- Push notifications for alerts
- Background sync for pantry updates when back online

### 27.12 Gamification
- "Zero Waste Week" badge when no items expired
- "Master Chef" badge for 30 days of meal planning
- "Full Pantry" badge for >100 items tracked
- Leaderboard: Most recipes tried in the community

### 27.13 Inventory Export
- Export pantry as CSV/Excel
- Export monthly grocery list PDF
- Export nutrition report PDF
- Export for insurance (home contents tracking)

### 27.14 Multi-Language Support
- English, Hindi, Gujarati, Marathi, Tamil, Telugu
- Recipe names shown in regional language
- Ingredient names with regional aliases

### 27.15 Health Integrations (Future)
- Connect with fitness apps (HealthKit, Google Fit)
- Meal suggestions adjusted based on workout days
- Diabetic-friendly mode with glycemic index tracking

---

## 28. Security Architecture

### Authentication Security
- Passwords hashed with bcrypt (cost factor 12)
- JWT access tokens expire in 60 minutes
- Refresh tokens stored in httpOnly cookies (not localStorage)
- Refresh token rotation on every use
- Blacklist revoked refresh tokens in Redis

### API Security
- Rate limiting: 100 req/min for authenticated, 20 req/min for anonymous
- CORS: Whitelist only frontend domain
- CSRF protection enabled for non-API views
- All API endpoints require authentication (except public: landing, auth)
- Input sanitization on all POST/PATCH endpoints
- Parameterized queries (no raw string queries to MongoDB)

### Data Security
- Family food data isolated by kitchen_id (every query scoped)
- Admin cannot access other kitchens' data
- Members cannot access analytics or alert data
- Kitchen invite codes expire after 72 hours
- PII (emails, phone) encrypted at rest (MongoDB field-level encryption)

### Infrastructure Security
- HTTPS enforced (SSL/TLS 1.3)
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type
- Cloudflare WAF (Web Application Firewall)
- Secrets in environment variables (never in code)
- Dependency scanning (GitHub Dependabot)

---

## 29. File & Media Storage

### AWS S3 Structure

```
s3://pantrytoplate-storage/
├── profile-photos/{user_id}/avatar.jpg
├── pantry-items/{kitchen_id}/{item_id}/photo.jpg
├── recipes/
│   ├── curated/{recipe_id}/thumbnail.jpg
│   └── community/{recipe_id}/thumbnail.jpg
├── receipts/{kitchen_id}/{scan_id}/receipt.jpg
└── exports/{kitchen_id}/
    ├── pantry_export_{date}.csv
    └── grocery_list_{date}.pdf
```

### File Upload Constraints
- Profile photo: max 2MB, JPEG/PNG only
- Pantry item photo: max 5MB, JPEG/PNG
- Recipe thumbnail: max 5MB, JPEG/PNG
- Receipt scan: max 10MB, JPEG/PNG/PDF
- All images processed through Pillow for resize & compression

---

## 30. Notifications Infrastructure

### Notification Channels

```
Notification Event → Notification Service
                      ├── In-App (WebSocket push to connected client)
                      ├── Email (SendGrid via Celery async task)
                      └── Push (Firebase Cloud Messaging via service worker)
```

### Notification Preferences (User-Controlled)

Users can configure per notification type:
- Expiry alerts: Email + Push
- Daily meal plan: Push only
- Family chat: In-App only
- Shopping trip completed: Email summary
- Weekly analytics report: Email

### Email Templates
- Welcome email (onboarding)
- Email verification
- Family invite
- Password reset
- Daily meal plan (optional, opt-in)
- Weekly pantry summary
- Expiry alerts digest (critical only)

---

## 31. Deployment Architecture

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.9'

services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    volumes: ["./frontend:/app"]
    
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_URL=redis://redis:6379
    depends_on: [mongodb, redis]
    
  daphne:
    build: ./backend
    command: daphne -b 0.0.0.0 -p 8001 pantrytoplate.asgi:application
    ports: ["8001:8001"]
    depends_on: [redis]
    
  celery:
    build: ./backend
    command: celery -A pantrytoplate worker -l info
    depends_on: [redis, backend]
    
  celery-beat:
    build: ./backend
    command: celery -A pantrytoplate beat -l info
    depends_on: [redis]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo_data:/data/db"]
    
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on: [frontend, backend, daphne]
```

### Production Architecture (AWS)

```
Route53 (DNS) 
     ↓
CloudFront (CDN + Edge cache for static assets)
     ↓
Application Load Balancer
   ├── /api/* → ECS Fargate (Django/Gunicorn)
   └── /ws/*  → ECS Fargate (Daphne)
   
ECS Fargate:
   ├── Backend Service (Django + Gunicorn) × 2 instances (auto-scale)
   ├── Daphne Service (WebSocket) × 2 instances
   └── Celery Worker Service × 1 instance
   
ElastiCache Redis (cluster mode)
MongoDB Atlas (M10 cluster, multi-AZ)
S3 (media storage, versioning enabled)
SES (email delivery)
CloudWatch (logs & metrics)
```

---

## 32. Project Folder Structure

```
pantry-to-plate/
│
├── frontend/                      ← React (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── i18n/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                       ← Django
│   ├── pantrytoplate/             ← Django project root
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── asgi.py               ← Channels ASGI config
│   │   └── wsgi.py
│   │
│   ├── apps/
│   │   ├── auth_app/             ← Authentication
│   │   ├── kitchen/              ← Kitchen & member management
│   │   ├── pantry/               ← Pantry CRUD
│   │   ├── buylist/              ← To-Buy list
│   │   ├── recipes/              ← Recipe library + community
│   │   ├── mealplans/            ← Meal planning
│   │   ├── chat/                 ← Real-time chat (Channels)
│   │   ├── alerts/               ← Alert system
│   │   ├── dietary/              ← Dietary profiles
│   │   ├── analytics/            ← Reports & charts
│   │   └── ai_engine/            ← ML models & suggestion engine
│   │
│   ├── ai/
│   │   ├── meal_suggester.py
│   │   ├── preference_model.py   ← TensorFlow NCF model
│   │   ├── waste_predictor.py
│   │   ├── grocery_predictor.py
│   │   └── models/               ← Saved ML model files (.h5, .pkl)
│   │
│   ├── data_seed/
│   │   ├── master_items_seed.py  ← 500+ food items seed
│   │   ├── recipes_seed.py       ← 200+ curated recipes
│   │   └── categories_seed.py
│   │
│   ├── celery_tasks/
│   │   ├── alert_tasks.py
│   │   ├── report_tasks.py
│   │   └── email_tasks.py
│   │
│   ├── utils/
│   │   ├── response.py           ← Standardized API response helpers
│   │   ├── permissions.py
│   │   └── validators.py
│   │
│   ├── requirements.txt
│   ├── manage.py
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
└── README.md
```

---

## 33. Development Phases & Milestones

### Phase 1 — Foundation (Weeks 1–3)
**Goal: Working Auth + Basic Pantry**
- [ ] Project setup: Vite + React + TailwindCSS
- [ ] Django project setup with MongoDB connection
- [ ] User authentication (Register, Login, JWT)
- [ ] Kitchen creation model
- [ ] Pantry CRUD APIs
- [ ] Basic pantry UI (list, add, edit, delete)
- [ ] Master items database seed (first 200 items)
- [ ] Category system

### Phase 2 — Core Features (Weeks 4–6)
**Goal: Pantry + Buy List + Alerts working**
- [ ] To-Buy List CRUD
- [ ] Family invite system (invite code + email)
- [ ] Member join flow
- [ ] Alert system (expiry, low stock triggers)
- [ ] Celery task: daily expiry check
- [ ] Alert Center UI
- [ ] Notification emails (SendGrid setup)
- [ ] Admin Dashboard with widgets
- [ ] Expiry color coding on pantry items

### Phase 3 — AI & Recipes (Weeks 7–9)
**Goal: AI meal suggestion + Recipe library**
- [ ] Master items expanded to 500+ items
- [ ] Recipe database seed (100+ recipes)
- [ ] Basic ML meal suggestion engine (content-based)
- [ ] Dietary preference filtering
- [ ] AI Suggest Meals UI
- [ ] Recipe Library page
- [ ] Recipe Detail page with YouTube links
- [ ] 3-Course Meal Planner (basic)
- [ ] "Add missing to buy list" from recipe

### Phase 4 — Family & Communication (Weeks 10–12)
**Goal: Real-time chat + Family features**
- [ ] Django Channels setup
- [ ] WebSocket chat implementation
- [ ] Chat UI (Socket.io-client)
- [ ] Meal broadcast to family
- [ ] Poll creation and voting
- [ ] Dietary profiles per member
- [ ] Allergy warnings on recipes
- [ ] Member Dashboard

### Phase 5 — Analytics & Community (Weeks 13–15)
**Goal: Analytics + Community recipes**
- [ ] Admin analytics APIs
- [ ] Charts (Recharts): Pantry health, most used, waste
- [ ] Analytics Dashboard page
- [ ] Community recipe posting
- [ ] Community feed + ratings
- [ ] Save recipes to cookbook
- [ ] Deep Learning preference model (NCF)
- [ ] Weekly meal planner AI

### Phase 6 — Polish & Advanced (Weeks 16–18)
**Goal: PWA, performance, advanced features**
- [ ] PWA manifest + service worker
- [ ] Push notifications (Firebase)
- [ ] Multi-language (i18next: EN, HI, GU)
- [ ] Receipt scanner (OCR)
- [ ] Festival meal plan templates
- [ ] Performance optimization (React Query cache, lazy loading)
- [ ] Accessibility audit (a11y)
- [ ] Mobile responsiveness audit

### Phase 7 — QA & Launch (Weeks 19–20)
**Goal: Production ready**
- [ ] Unit tests (Django + React)
- [ ] Integration tests (API)
- [ ] Load testing (Locust)
- [ ] Security audit
- [ ] Docker production setup
- [ ] AWS deployment
- [ ] Domain + SSL setup
- [ ] Beta testing with 10 families
- [ ] Bug fixes from beta feedback
- [ ] Public launch 🎉

---

## 34. API Endpoint Reference

Complete reference table for all endpoints (see Section 9 for detailed specs).

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | /auth/register/ | ❌ | — | Admin registration |
| POST | /auth/login/ | ❌ | — | Login |
| POST | /auth/member-join/ | ❌ | — | Member join with code |
| GET | /auth/me/ | ✅ | Any | Current user |
| POST | /kitchen/create/ | ✅ | Admin | Create kitchen |
| GET | /kitchen/members/ | ✅ | Admin | List members |
| GET | /pantry/items/ | ✅ | Any | List pantry |
| POST | /pantry/items/ | ✅ | Any | Add item |
| PATCH | /pantry/items/{id}/ | ✅ | Any | Edit item |
| DELETE | /pantry/items/{id}/ | ✅ | Admin/Owner | Delete item |
| GET | /pantry/search/ | ✅ | Any | Autocomplete search |
| GET | /buylist/ | ✅ | Any | Get buy list |
| POST | /buylist/items/ | ✅ | Any | Add to buy list |
| POST | /ai/suggest-meals/ | ✅ | Any | Get AI suggestions |
| POST | /ai/plan-3-course/ | ✅ | Any | 3-course plan |
| GET | /recipes/ | ✅ | Any | Recipe library |
| GET | /recipes/by-pantry/ | ✅ | Any | Cookable recipes |
| GET | /recipes/community/ | ✅ | Any | Community feed |
| POST | /recipes/community/ | ✅ | Any | Post recipe |
| GET | /alerts/ | ✅ | Admin | All alerts |
| GET | /analytics/pantry-health/ | ✅ | Admin | Health report |
| GET | /chat/messages/ | ✅ | Any | Chat history |
| POST | /chat/polls/ | ✅ | Admin | Create poll |
| WS | /ws/kitchen/{id}/ | ✅ | Any | Real-time chat |

---

## 35. Environment Variables & Configuration

```bash
# .env.example

# Django
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.pantrytoplate.app,localhost

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB=pantrytoplate_prod

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=30

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
DEFAULT_FROM_EMAIL=noreply@pantrytoplate.app

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=pantrytoplate-storage
AWS_S3_REGION=ap-south-1

# Firebase (Push Notifications)
FIREBASE_SERVER_KEY=...
FIREBASE_PROJECT_ID=...

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8001
VITE_APP_ENV=development

# Stripe (for payments — future)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 36. Testing Strategy

### Backend Tests (pytest + pytest-django)

```python
# Structure
tests/
├── test_auth/
│   ├── test_registration.py
│   ├── test_login.py
│   └── test_member_join.py
├── test_pantry/
│   ├── test_crud.py
│   ├── test_permissions.py
│   └── test_expiry.py
├── test_ai/
│   ├── test_meal_suggestion.py
│   └── test_dietary_filter.py
├── test_alerts/
│   └── test_trigger_conditions.py
└── test_integration/
    └── test_full_flow.py
```

**Target Coverage: 80%+**

### Frontend Tests (Vitest + React Testing Library)

```javascript
// Example: PantryItem add test
test('adds item to pantry successfully', async () => {
  render(<AddItemModal isOpen={true} onClose={jest.fn()} />);
  
  await userEvent.type(screen.getByLabelText('Item Name'), 'Spinach');
  await userEvent.type(screen.getByLabelText('Quantity'), '500');
  await userEvent.selectOptions(screen.getByLabelText('Unit'), 'g');
  await userEvent.click(screen.getByRole('button', { name: /add item/i }));
  
  expect(mockPantryService.addItem).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Spinach', quantity: 500, unit: 'g' })
  );
});
```

### Load Testing (Locust)

```python
# locustfile.py
class KitchenUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def view_pantry(self):
        self.client.get("/api/v1/pantry/items/", headers=self.auth_header)
    
    @task(1)
    def get_ai_suggestion(self):
        self.client.post("/api/v1/ai/suggest-meals/", headers=self.auth_header)
    
    @task(2)
    def view_recipes(self):
        self.client.get("/api/v1/recipes/", headers=self.auth_header)
```

**Load test target**: 1000 concurrent users, <500ms P95 response time

---

## 37. Error Handling & Logging

### Standardized API Response Format

```python
# utils/response.py

def success_response(data, message="Success", status_code=200):
    return Response({
        "status": "success",
        "message": message,
        "data": data
    }, status=status_code)

def error_response(message, errors=None, status_code=400):
    return Response({
        "status": "error",
        "message": message,
        "errors": errors or {}
    }, status=status_code)
```

### Error Codes

| Code | Meaning |
|---|---|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Token expired |
| AUTH_003 | Invalid invite code |
| PANTRY_001 | Item not found |
| PANTRY_002 | Duplicate item name |
| AI_001 | Not enough pantry data for suggestion |
| KITCHEN_001 | Kitchen not found |
| PERM_001 | Insufficient permissions |

### Logging Configuration

```python
LOGGING = {
    'version': 1,
    'handlers': {
        'console': { 'class': 'logging.StreamHandler' },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/pantrytoplate/app.log',
            'maxBytes': 10485760,  # 10 MB
            'backupCount': 5,
        },
        'sentry': {
            'class': 'sentry_sdk.integrations.logging.EventHandler',
            'level': 'ERROR',
        }
    },
    'loggers': {
        'django': { 'handlers': ['console', 'file'], 'level': 'INFO' },
        'pantrytoplate': { 'handlers': ['console', 'file', 'sentry'], 'level': 'DEBUG' },
        'celery': { 'handlers': ['console', 'file'], 'level': 'INFO' }
    }
}
```

---

## 38. Internationalisation & Localisation

### Languages Supported
- English (en) — Default
- Hindi (hi)
- Gujarati (gu)
- Marathi (mr) — Phase 2

### i18n Key Structure

```json
// en.json
{
  "pantry": {
    "title": "My Pantry",
    "add_item": "Add Item",
    "search_placeholder": "Search items...",
    "categories": {
      "vegetables": "Vegetables",
      "fruits": "Fruits",
      "dairy": "Dairy"
    },
    "status": {
      "fresh": "Fresh",
      "expiring_soon": "Expiring Soon",
      "expired": "Expired"
    }
  },
  "ai": {
    "suggest_button": "Suggest Meals",
    "reason_label": "Why this?",
    "missing_items": "Missing {{count}} items"
  }
}
```

### Date & Number Localisation
- Dates: DD/MM/YYYY format (Indian standard)
- Numbers: Indian number system (1,00,000 not 100,000)
- Currency: ₹ (INR) by default

---

## 39. Accessibility (a11y)

### Standards
- WCAG 2.1 Level AA compliance target
- Semantic HTML5 elements (nav, main, section, article)
- ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader tested (NVDA + Chrome)

### Specific Requirements
- All images have alt text
- Color is never the only indicator (also use icons + text for expiry status)
- Minimum contrast ratio 4.5:1 for normal text
- Focus indicators visible on all interactive elements
- Form error messages announced to screen readers
- Modals trap focus and close on Escape
- Reduce motion support (`prefers-reduced-motion` media query)

---

## 40. Future Roadmap

### Version 2.0 (6 months post-launch)
- Mobile apps (React Native — iOS + Android)
- WhatsApp Business API integration
- AI Chef natural language interface
- Receipt scanner (OCR)
- Grocery store API integration (BigBasket, Blinkit)
- Calorie & nutrition tracker

### Version 3.0 (12 months post-launch)
- Voice assistant integration
- IoT integration (smart fridge sensors)
- Subscription meal kits (partnership with meal kit companies)
- Restaurant-mode (for small dhabas/cloud kitchens)
- Multi-kitchen support (for users managing multiple properties)
- API for third-party integrations

### Version 4.0 (18 months post-launch)
- B2B: Corporate cafeteria version
- Tiffin service management
- Community cooking events & virtual potlucks
- Nutritionist consultation integration
- Hyperlocal grocery price comparison

---

## Appendix A — Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Python files | snake_case | `meal_suggester.py` |
| Python classes | PascalCase | `MealSuggestionEngine` |
| Python variables | snake_case | `pantry_items` |
| React components | PascalCase | `PantryItemCard.jsx` |
| React hooks | camelCase with 'use' | `usePantry.js` |
| CSS classes | kebab-case (or Tailwind) | `glass-card` |
| MongoDB collections | snake_case plural | `pantry_items` |
| API endpoints | kebab-case | `/suggest-meals/` |
| Environment variables | SCREAMING_SNAKE | `JWT_SECRET_KEY` |

---

## Appendix B — Glossary

| Term | Definition |
|---|---|
| Admin | Primary kitchen manager (usually head of household). Full access. |
| Member | Family member with collaborative access, scoped permissions. |
| Kitchen | A shared kitchen space identified by a unique ID and invite code. |
| Pantry | The digital inventory of food items in a kitchen. |
| Master Items | Read-only database of 500+ food items with metadata. |
| Buy List | A collaborative shopping list for the kitchen. |
| AI Engine | The ML-based meal suggestion and prediction system. |
| Upwas | Hindu fasting diet — specific ingredients only (Sabudana, Rajgira etc.) |
| Jain Diet | Vegetarian diet excluding root vegetables, following Jain principles. |
| Pantry Health Score | 0–100 score measuring freshness and completeness of pantry. |
| Freshness Boost | AI bonus score given to recipes using near-expiry ingredients. |
| NCF | Neural Collaborative Filtering — deep learning model for preferences. |

---

*Document prepared for Pantry to Plate development team. All decisions, APIs, and architectures are recommendations based on current requirements and industry best practices. The development team should review and adapt as needed.*

**Total Estimated Development Time**: 18–20 weeks (1 full-stack developer) | 10–12 weeks (team of 3)

**Revision History**:
- v1.0 — Initial complete specification — Dec 2024
