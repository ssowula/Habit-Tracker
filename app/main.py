from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from . import crud, models, schemas, security, dependencies
from .database import engine
from .schemas import HabitCreate
from typing import List
models.Base.metadata.create_all(bind=engine)
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "null",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def user_register(user: schemas.UserCreate, db: Session = Depends(dependencies.get_db)):
    if crud.get_user_by_username(db=db, username=user.username):
        raise HTTPException(status_code=400, detail="Taki użytkownik już istnieje.")
    return crud.create_user(db=db, user=user)

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(dependencies.get_db)):
    db_user = crud.get_user_by_username(db=db, username=form_data.username)
    if not db_user or not security.verify_password(form_data.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Niepoprawna nazwa użytkownika lub hasło",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = security.create_access_token(
        data={"sub": db_user.username}
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@app.post("/habits/",response_model=schemas.Habit)
def create_habit(habit: HabitCreate, db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return crud.create_habit(db=db,user_id=current_user.id,habit=habit)

@app.get("/habits/", response_model=List[schemas.Habit])
def get_habits(db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return crud.get_habits(db=db,user_id=current_user.id)