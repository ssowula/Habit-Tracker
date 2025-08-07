from fastapi import FastAPI, Depends, HTTPException,status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import schemas,dependencies,crud,security

app = FastAPI()

@app.post("/register",response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def user_register(user: schemas.UserCreate, db: Session = Depends(dependencies.get_db)):
    if crud.get_user_by_username(db=db,username=user.username):
        raise HTTPException(status_code=400, detail="Taki użytkownik już istnieje.")
    return crud.create_user(db=db,user=user)

@app.post("/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(dependencies.get_db)):
    db_user = crud.get_user_by_username(db=db, username=form_data.username)
    if not db_user or not security.verify_password(form_data.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Niepoprawna nazwa użytkownika lub hasło",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = f"{db_user.username}_fake_token"
    return {"access_token": access_token, "token_type": "bearer"}
