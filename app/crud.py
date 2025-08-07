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