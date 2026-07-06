import os
import re
import io
from datetime import datetime, timedelta
from typing import List, Optional

# Third Party Framework Primitives
from fastapi import FastAPI, UploadFile, File, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# ------------------------------------------------------------------
# 1. CORE APPS & APPLICATION GLOBAL PARAMETERS
# ------------------------------------------------------------------
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8001",
    "https://job-board-assessment-one.vercel.app",
    "https://job-board-assessment-git-main-ganesh0770s-projects.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "SUPER_SECRET_KEY_FOR_JWT_VERIFICATION_DO_NOT_SHARE"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# ------------------------------------------------------------------
# 2. LOCAL PERSISTENT DATABASE ENGINE PRIMITIVES
# ------------------------------------------------------------------
DATABASE_URL = "sqlite:///./jobboard.db"
import bcrypt

def hash_password(password: str) -> str:
    # Standard modern bcrypt encoding & derivation pattern
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Database Relational Tables (Models) ---
class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "seeker" or "recruiter"

class JobModel(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    salary = Column(String, nullable=False)
    type = Column(String, nullable=False) 
    tags = Column(String, nullable=False)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

# ------------------------------------------------------------------
# 3. TYPE HOOK VALIDATORS (Pydantic Schemas)
# ------------------------------------------------------------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str  # 'seeker' or 'recruiter'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    salary: str
    type: str
    tags: List[str]

class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    salary: str
    type: str
    tags: List[str]

    class Config:
        from_attributes = True

class ResumeParsedData(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    text_preview: str

# ------------------------------------------------------------------
# 4. BUSINESS LOGIC HELPER UTILITIES
# ------------------------------------------------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def decode_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("id")
        role: str = payload.get("role")
        if email is None or user_id is None or role is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token verification cluster")
        return {"id": user_id, "email": email, "role": role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid workspace session credentials")

def extract_info(text: str):
    email_regex = r'[\w\.-]+@[\w\.-]+\.\w+'
    phone_regex = r'\+?\d[\d -]{8,12}\d'
    
    email = re.search(email_regex, text)
    phone = re.search(phone_regex, text)
    
    skill_bank = ["React", "Next.js", "Python", "FastAPI", "TypeScript", "JavaScript", "SQL", "Docker", "AWS", "CI/CD", "Tailwind"]
    found_skills = [skill for skill in skill_bank if skill.lower() in text.lower()]
    
    return {
        "email": email.group(0) if email else None,
        "phone": phone.group(0) if phone else None,
        "skills": found_skills
    }

# ------------------------------------------------------------------
# 5. API ROUTE ROUTERS
# ------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    if user.role not in ['seeker', 'recruiter']:
        raise HTTPException(status_code=400, detail="Invalid system deployment role assignment")
    
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Target email identity cluster already registered")
        
    new_user = UserModel(
        email=user.email, 
        hashed_password=hash_password(user.password), 
        role=user.role
    )
    db.add(new_user)
    db.commit()
    return {"message": "Account pipeline indexed successfully"}

@app.post("/api/auth/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credential matching parameter validation drop")
    
    token_data = {"id": db_user.id, "sub": db_user.email, "role": db_user.role}
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data.update({"exp": expire})
    
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "role": db_user.role}

@app.get("/api/jobs", response_model=List[JobResponse])
def get_jobs(db: Session = Depends(get_db)):
    rows = db.query(JobModel).all()
    results = []
    for row in rows:
        results.append({
            "id": row.id, 
            "title": row.title, 
            "company": row.company,
            "location": row.location, 
            "salary": row.salary, 
            "type": row.type,
            "tags": [t.strip() for t in row.tags.split(",") if t] if row.tags else []
        })
    return results

@app.post("/api/jobs/create", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def post_job(job: JobCreate, current_user: dict = Depends(decode_token), db: Session = Depends(get_db)):
    print("job creation")
    if current_user["role"] != "recruiter":
        raise HTTPException(status_code=403, detail="Unauthorized workspace action. Seekers cannot spin up vacancies.")
    
    try:
        db_job = JobModel(
            recruiter_id=current_user["id"],
            title=job.title,
            company=job.company,
            location=job.location,
            salary=job.salary,
            type=job.type,
            tags=",".join(job.tags)
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        
        return JobResponse(
            id=db_job.id,
            title=db_job.title,
            company=db_job.company,
            location=db_job.location,
            salary=db_job.salary,
            type=db_job.type,
            tags=[t.strip() for t in db_job.tags.split(",") if t] if db_job.tags else []
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database pipeline failure: {str(e)}")

@app.post("/api/v1/parse-resume", response_model=ResumeParsedData)
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only structural PDF layouts are supported.")
    
    try:
        pdf_bytes = await file.read()
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = ""
        
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        
        parsed_meta = extract_info(extracted_text)
        
        return ResumeParsedData(
            email=parsed_meta["email"],
            phone=parsed_meta["phone"],
            skills=parsed_meta["skills"],
            text_preview=extracted_text[:500] + "..."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing PDF payload: {str(e)}")