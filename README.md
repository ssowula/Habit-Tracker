# 📊 Habit Tracker – Aplikacja do Śledzenia Nawyków

Prosty, ale w pełni funkcjonalny **full-stack** projekt do śledzenia nawyków, zbudowany w oparciu o **FastAPI** i **Vanilla JavaScript**.  
Projekt powstał jako **portfolio** demonstrujące umiejętności w zakresie backendu, frontendu i ich integracji w jednym repozytorium.

---

## ✨ Funkcjonalności

- ✅ **Rejestracja i logowanie** – bezpieczne hashowanie haseł (bcrypt)  
- 🔐 **Autoryzacja JWT** – tokeny z określonym czasem ważności  
- 📝 **Zarządzanie nawykami** – dodawanie codziennych, tygodniowych i miesięcznych nawyków  
- 📅 **Lista *Na dziś*** – automatyczne generowanie zadań na bieżący dzień  
- ✔️ **Oznaczanie ukończonych nawyków** – zapis w bazie danych na potrzeby przyszłych statystyk  
- 🚀 **Zintegrowany backend + frontend** – brak problemów z CORS, uruchamiane jedną komendą

---

## 🛠 Stos technologiczny

**Backend**
- Python 3.11+
- FastAPI
- SQLAlchemy (ORM)
- Uvicorn (ASGI Server)
- Passlib + Bcrypt (hashowanie haseł)
- python-jose (obsługa JWT)

**Baza danych**
- SQLite

**Frontend**
- HTML5
- CSS3
- JavaScript (ES6+)

---

## 📦 Instalacja i uruchomienie

### 1️⃣ Klonowanie repozytorium
```bash
git clone https://github.com/ssowula/Habit-Tracker.git
cd Habit-Tracker
```

### 2️⃣ Środowisko wirtualne
```bash
# Utworzenie środowiska
python -m venv .venv

# Aktywacja w Windows
.venv\Scripts\activate

# Aktywacja w macOS / Linux
source .venv/bin/activate
```

### 3️⃣ Instalacja zależności
```bash
pip install -r requirements.txt
```

### 4️⃣ Uruchomienie aplikacji
```bash
uvicorn app.main:app --reload
```

### 5️⃣ Otwórz w przeglądarce
[http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 📂 Struktura projektu

```
Habit-Tracker/
├── app/                  # Backend – FastAPI
│   ├── crud.py
│   ├── database.py
│   ├── dependencies.py
│   ├── main.py           # Główna logika API
│   ├── models.py
│   ├── schemas.py
│   └── security.py
│
├── frontend/             # Frontend – HTML, CSS, JS
│   ├── index.html
│   ├── HabitsDashboard.html
│   ├── HabitsToday.html
│   ├── main.css
│   └── main.js
│
└── requirements.txt      # Lista zależności Pythona
```

---