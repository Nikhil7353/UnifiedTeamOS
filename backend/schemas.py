from pydantic import BaseModel
from typing import Optional

# What React sends during Register
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# What React sends during Login
class UserLogin(BaseModel):
    username: str
    password: str

# What we send back to React (HIDE the password!)
class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True