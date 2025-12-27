import os
from passlib.context import CryptContext
from typing import Optional
from datetime import datetime, timedelta, timezone 
from jose import jwt, JWTError

# --- CONFIGURATION ---

# Using a robust scheme (PBKDF2) that does not have the 72-byte limit
pwd_context = CryptContext(
    # 🌟 NEW SCHEME: Use PBKDF2 SHA-256, which natively supports passwords > 72 bytes
    schemes=["pbkdf2_sha256"], 
    deprecated="auto"
)

# ... (rest of the configuration remains the same) ...
SECRET_KEY = os.environ.get("SECRET_KEY", "Insecure-Default-Key-Change-Me-For-Production-12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 

# --- PASSWORD HASHING FUNCTIONS ---

def hash_password(password: str) -> str:
    # No truncation needed! PBKDF2 SHA-256 handles long passwords natively.
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    # No truncation needed! PBKDF2 SHA-256 handles long passwords natively.
    return pwd_context.verify(plain, hashed)

# ... (JWT functions remain the same) ...
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire.timestamp()}) 
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None