# 🚀 Complete End-to-End Deployment Guide: Pantry to Plate

## 📊 Total Environment Variables Breakdown

### 🟢 Frontend Environment Variables (Vercel)
> **Total: 1 Required Variable**

| # | Variable Name | Required? | Example / Production Value | Description |
|---| :--- | :---: | :--- | :--- |
| 1 | `VITE_API_URL` | **Yes** | `https://pantry-to-plate-backend.onrender.com/api/v1` | Production base API endpoint URL pointing to your Render backend service |

---

### 🔵 Backend Environment Variables (Render Web Service)
> **Total: 6 Required Variables (+ 4 Optional = 10 Total)**

| # | Variable Name | Required? | Example / Default Value | Description |
|---| :--- | :---: | :--- | :--- |
| 1 | `DJANGO_SETTINGS_MODULE` | **Yes** | `pantrytoplate.settings_prod` | Instructs Django to load the production configuration (`settings_prod.py`) |
| 2 | `SECRET_KEY` | **Yes** | `django-insecure-prod-xyz9876543210abc` | Strong, random secret key for session & token cryptography |
| 3 | `MONGODB_URI` | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net/pantrytoplate_prod?retryWrites=true&w=majority` | Production MongoDB Atlas cluster connection string |
| 4 | `ALLOWED_HOSTS` | **Yes** | `pantry-to-plate-backend.onrender.com,localhost` | Host headers permitted by Django |
| 5 | `CORS_ALLOWED_ORIGINS` | **Yes** | `https://pantry-to-plate.vercel.app` | Vercel production frontend URL permitted to make API calls |
| 6 | `GEMINI_API_KEY` | **Yes** | `AIzaSyB...` | Google Gemini AI key for zero-waste recipe generation & meal planner |
| 7 | `MONGODB_DB_NAME` | *Optional* | `pantrytoplate_prod` | Database name override (defaults to `pantrytoplate_prod`) |
| 8 | `REDIS_URL` | *Optional* | `redis://default:pass@redis-host:6379/0` | Optional Redis URL if caching/Celery worker is enabled |
| 9 | `EMAIL_HOST_USER` | *Optional* | `kitchen@pantrytoplate.com` | SMTP Email address for verification OTPs & password reset emails |
| 10 | `EMAIL_HOST_PASSWORD` | *Optional* | `app-password-here` | SMTP App password for email delivery |

---

## 🗄️ STEP 1: Database Setup (MongoDB Atlas)

1. Sign up or log in to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**.
2. Create a **Free Shared Cluster (M0)**.
3. Go to **Database Access** -> **Add New Database User**:
   - Create a user (e.g. `pantry_admin`) and set a strong password.
4. Go to **Network Access** -> **Add IP Address**:
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) so Render cloud servers can connect.
5. Click **Database** -> **Connect** -> **Drivers**:
   - Copy your connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/pantrytoplate_prod?retryWrites=true&w=majority
     ```

---

## 🐍 STEP 2: Deploy Backend on Render

1. Log in to **[Render.com](https://render.com)**.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `Mokshilxhah/Pantry_To_Plate`.
4. Configure Web Service settings:
   - **Name**: `pantry-to-plate-backend`
   - **Region**: Choose closest to your users (e.g. Singapore / Frankfurt / Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command**:
     ```bash
     gunicorn pantrytoplate.wsgi:application --bind 0.0.0.0:$PORT
     ```
5. Add Environment Variables under **Environment**:

   | Key | Value |
   | :--- | :--- |
   | `DJANGO_SETTINGS_MODULE` | `pantrytoplate.settings_prod` |
   | `SECRET_KEY` | `django-insecure-prod-key-xyz987654321` *(random string)* |
   | `MONGODB_URI` | `mongodb+srv://...` *(from Step 1)* |
   | `ALLOWED_HOSTS` | `pantry-to-plate-backend.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://pantry-to-plate.vercel.app` |
   | `GEMINI_API_KEY` | *Your Google Gemini API key* |

6. Click **Create Web Service**.
7. Once deployed, copy your Render service URL (e.g., `https://pantry-to-plate-backend.onrender.com`).

---

## ⚡ STEP 3: Deploy Frontend on Vercel

1. Log in to **[Vercel.com](https://vercel.com)**.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository `Mokshilxhah/Pantry_To_Plate`.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:

   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://pantry-to-plate-backend.onrender.com/api/v1` |

6. Click **Deploy**.
7. Copy your deployed Vercel URL (e.g., `https://pantry-to-plate.vercel.app`).

---

## 🔄 STEP 4: Final Handshake & CORS Sync

1. Go back to **Render** -> `pantry-to-plate-backend` -> **Environment**.
2. Make sure `CORS_ALLOWED_ORIGINS` contains your exact Vercel production URL:
   ```text
   https://pantry-to-plate.vercel.app
   ```
3. Click **Save Changes** (Render will automatically re-deploy in seconds).

---

## ✅ STEP 5: End-to-End Verification

1. Open your Vercel URL (`https://pantry-to-plate.vercel.app`) in your browser.
2. Test **Admin Registration** / **Member Login**.
3. Verify that Pantry items, AI Recipe Generator, Meal Planner, and Budget logs load seamlessly without CORS errors.
