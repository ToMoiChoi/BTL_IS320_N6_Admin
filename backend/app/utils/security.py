import os
from pathlib import Path
from passlib.context import CryptContext
from typing import Optional
from datetime import datetime, timedelta, timezone 
from jose import jwt, JWTError
from dotenv import load_dotenv

# Load environment variables - .env.local takes priority
env_local = Path(__file__).parent.parent.parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)
else:
    load_dotenv()

# --- CONFIGURATION ---

# Using a robust scheme (PBKDF2) that does not have the 72-byte limit
pwd_context = CryptContext(
    # 🌟 NEW SCHEME: Use PBKDF2 SHA-256, which natively supports passwords > 72 bytes
    schemes=["pbkdf2_sha256"], 
    deprecated="auto"
)

# Load from environment
SECRET_KEY = os.environ.get("SECRET_KEY", "Insecure-Default-Key-Change-Me-For-Production-12345")
ALGORITHM = os.environ.get("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

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