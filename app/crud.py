from sqlalchemy.orm import Session
from . import models, schemas, security

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.hash_password(user.password)
    username=user.username
    db_user = models.User(username=username,password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_habit(db: Session, habit: schemas.HabitCreate, user_id: int):
    name = habit.name
    frequency = habit.frequency
    db_habit = models.Habit(name=name,frequency=frequency,owner_id=user_id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit