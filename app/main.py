from datetime import date
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.staticfiles import StaticFiles
from . import crud, models, schemas, security, dependencies
from .database import engine
from .schemas import HabitCreate
from typing import List

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
@app.post("/register/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def user_register(user: schemas.UserCreate, db: Session = Depends(dependencies.get_db)):
    if crud.get_user_by_username(db=db, username=user.username):
        raise HTTPException(status_code=400, detail="Taki użytkownik już istnieje.")
    return crud.create_user(db=db, user=user)

@app.post("/token/")
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

@app.get("/users/me/", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@app.post("/habits/",response_model=schemas.Habit)
def create_habit(habit: HabitCreate, db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return crud.create_habit(db=db,user_id=current_user.id,habit=habit)

@app.get("/habits/", response_model=List[schemas.Habit])
def get_habits(db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return crud.get_habits(db=db,user_id=current_user.id)


@app.get("/habits/today/", response_model=List[schemas.HabitWithCompletionStatus])
def get_habits_for_today(db: Session = Depends(dependencies.get_db),current_user: models.User = Depends(dependencies.get_current_user)):
    today = date.today()

    query_result = db.query(models.Habit, models.HabitCompletion). \
        outerjoin(models.HabitCompletion,
                  (models.Habit.id == models.HabitCompletion.habit_id) &
                  (models.HabitCompletion.completion_date == today)). \
        filter(models.Habit.user_id == current_user.id).distinct().all()

    habits_with_status = []
    for habit, completion in query_result:
        is_scheduled_today = False
        if habit.frequency == 'codziennie':
            is_scheduled_today = True
        elif habit.frequency == 'co tydzien' and habit.created_at.weekday() == today.weekday():
            is_scheduled_today = True
        elif habit.frequency == 'co miesiac' and habit.created_at.day == today.day:
            is_scheduled_today = True

        if is_scheduled_today:
            habit_dto = schemas.HabitWithCompletionStatus(
                id=habit.id,
                name=habit.name,
                frequency=habit.frequency,
                created_at=habit.created_at,
                is_completed=True if completion else False,
                user_id=habit.user_id
            )
            habits_with_status.append(habit_dto)
    habits_with_status.sort(key=lambda habit: habit.is_completed)
    return habits_with_status
@app.post("/completions/")
def mark_habit_as_completed(completion: schemas.HabitCompletionCreate, db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    habit = db.query(models.Habit).filter(models.Habit.id == completion.habit_id,
                                          models.Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found or does not belong to user")

    today = date.today()
    existing_completion = db.query(models.HabitCompletion).filter(
        models.HabitCompletion.habit_id == completion.habit_id,
        models.HabitCompletion.completion_date == today
    ).first()

    if existing_completion:
        return {"message": f"Habit {completion.habit_id} was already marked as completed for today."}

    crud.create_habit_completion(db=db, habit_id=completion.habit_id)
    return {"message": f"Habit {completion.habit_id} marked as completed for today."}

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")