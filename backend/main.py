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
from pypdf import PdfReader  # Clean import for the PDF parser engine
from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# ------------------------------------------------------------------
# 1. APPLICATION CORE CONFIGURATIONS & GLOBAL PARAMETERS
# ------------------------------------------------------------------
app = FastAPI(title="Unified Global Job Platform Matrix API Engine")

origins = [
    "http://localhost:3000",
    "http://localhost:8001",
    "https://job-board-assessment-one.vercel.app",
    "https://job-board-assessment-git-main-ganesh0770s-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Combined for unblocked deployment handshakes
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
# 2. DATABASE SYSTEM ENGINE PRIMITIVES
# ------------------------------------------------------------------
DATABASE_URL = "sqlite:///./jobboard.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Add Application Tracking Model ---
class ApplicationModel(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, nullable=False)
    job_title = Column(String, nullable=False)
    seeker_email = Column(String, nullable=False)
    cover_letter = Column(String, nullable=False)
    status = Column(String, default="Pending") # Pending, Shortlisted, Rejected

from pydantic import BaseModel
from typing import List



class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: str

# --- Updated/New Routing Map Vectors ---
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
    description = Column(String, default="No description provided.") # Added field
    likes = Column(Integer, default=0)                              # Added field
class UserProfileModel(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=True) # Linked to authenticated sub node
    fullName = Column(String, default="John Doe")
    email = Column(String, unique=True, nullable=False)
    
    # 1. Professional Identity & Background
    headline = Column(String, default="")
    workExperience = Column(JSON, default=list)        
    educationCertifications = Column(JSON, default=list) 
    skillsInventory = Column(JSON, default=list)         

    # 2. Job Seeking Preferences
    openToWorkStatus = Column(String, default="Only Recruiters")
    desiredTitles = Column(JSON, default=list)
    desiredLocations = Column(JSON, default=list)
    jobTypes = Column(JSON, default=list)               

    # 3. Privacy, Visibility, and Security
    profileVisibility = Column(String, default="Public")
    autoShareResume = Column(Boolean, default=False)
    
    # 4. Application Management & Documents
    storedResumes = Column(JSON, default=list)          
    applicationTracker = Column(JSON, default=list)     

    # 5. Notifications & Alerts
    jobAlerts = Column(JSON, default=list)              

# Bind metadata to sqlite instance
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

# ------------------------------------------------------------------
# 3. DATA HOOK VALIDATORS (Pydantic Schemas)
# ------------------------------------------------------------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str  

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
    description: str  # Matches incoming frontend payload data stream
from datetime import datetime
class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    salary: str
    type: str
    tags: List[str]
    description: str  # Required for response serialization

    class Config:
        from_attributes = True


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
            "tags": [t.strip() for t in row.tags.split(",") if t] if row.tags else [],
            # Standardizes null/missing descriptions so legacy items don't break validation
            "description": row.description if row.description else "No description provided."
        })
    return results

class ResumeParsedData(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    text_preview: str

# Master Profile Deep Structures
class ProfessionalIdentity(BaseModel):
    headline: str
    workExperience: List[dict]
    educationCertifications: List[dict]
    skillsInventory: List[str]

class JobPreferences(BaseModel):
    openToWorkStatus: str
    desiredTitles: List[str]
    desiredLocations: List[str]
    jobTypes: List[str]

class PrivacySettings(BaseModel):
    profileVisibility: str
    autoShareResume: bool

class AppManagement(BaseModel):
    storedResumes: List[dict]
    applicationTracker: List[dict]

class NotificationAlerts(BaseModel):
    jobAlerts: List[dict]

class MasterProfileSchema(BaseModel):
    fullName: str
    email: EmailStr
    identity: ProfessionalIdentity
    preferences: JobPreferences
    privacy: PrivacySettings
    applications: AppManagement
    alerts: NotificationAlerts

# ------------------------------------------------------------------
# 4. SECURITY & DATA PARSING UTILITY FUNCTIONS
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
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid metadata credentials inside token payload.")
        return {"id": user_id, "email": email, "role": role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session context map missing or expired.")

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

def seed_default_profile(db: Session):
    profile = db.query(UserProfileModel).filter_by(id=1).first()
    if not profile:
        new_profile = UserProfileModel(
            id=1,
            fullName="John Doe",
            email="john.doe@vectorpipeline.io",
            headline="Staff Production Platform Engineer | Architect",
            workExperience=[{"title": "Senior Cloud Developer", "company": "Vector Pipeline", "dates": "2023 - Present"}],
            educationCertifications=[{"degree": "B.S. Computer Science", "school": "MIT"}],
            skillsInventory=["Python", "FastAPI", "React", "TypeScript", "SQLAlchemy"],
            openToWorkStatus="Recruiters Only",
            desiredTitles=["Staff Engineer", "Engineering Manager"],
            desiredLocations=["Remote US", "New York"],
            jobTypes=["Full-time", "Contract"],
            profileVisibility="Public",
            autoShareResume=False,
            storedResumes=[{"name": "Master_CV_2026.pdf", "uploaded": "2026-03-12"}],
            applicationTracker=[{"id": 101, "role": "Principal Eng", "company": "ScaleAI", "status": "Interviewing"}],
            jobAlerts=[{"keyword": "FastAPI Remote", "frequency": "Daily"}]
        )
        db.add(new_profile)
        db.commit()

# ------------------------------------------------------------------
# 5. FUNCTIONAL ROUTER PATHWAY MAPS
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

@app.post("/api/jobs/create", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def post_job(job: JobCreate, current_user: dict = Depends(decode_token), db: Session = Depends(get_db)):
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
            tags=",".join(job.tags),
            description=job.description  # 1. SAVE IT TO THE DATABASE
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        
        return JobResponse(
            id=db_job.id,
            title=db_job.title,
            company=db_job.company,
            location=db_job.location, # Safe reference
            salary=db_job.salary,
            type=db_job.type,
            tags=[t.strip() for t in db_job.tags.split(",") if t] if db_job.tags else [],
            description=db_job.description  # 2. RETURN IT IN THE RESPONSE
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

# ------------------------------------------------------------------
# 6. MASTER ECOSYSTEM 5-PART ARCHITECTURE PROFILE ENDPOINTS
# ------------------------------------------------------------------
@app.get("/api/profile", response_model=MasterProfileSchema)
async def get_master_profile(db: Session = Depends(get_db)):
    seed_default_profile(db)
    profile = db.query(UserProfileModel).filter_by(id=1).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Ecosystem profile matrix target completely empty.")
    
    return MasterProfileSchema(
        fullName=profile.fullName,
        email=profile.email,
        identity=ProfessionalIdentity(
            headline=profile.headline,
            workExperience=profile.workExperience,
            educationCertifications=profile.educationCertifications,
            skillsInventory=profile.skillsInventory
        ),
        preferences=JobPreferences(
            openToWorkStatus=profile.openToWorkStatus,
            desiredTitles=profile.desiredTitles,
            desiredLocations=profile.desiredLocations,
            jobTypes=profile.jobTypes
        ),
        privacy=PrivacySettings(
            profileVisibility=profile.profileVisibility,
            autoShareResume=profile.autoShareResume
        ),
        applications=AppManagement(
            storedResumes=profile.storedResumes,
            applicationTracker=profile.applicationTracker
        ),
        alerts=NotificationAlerts(
            jobAlerts=profile.jobAlerts
        )
    )

@app.post("/api/profile")
async def update_master_profile(payload: MasterProfileSchema, db: Session = Depends(get_db)):
    profile = db.query(UserProfileModel).filter_by(id=1).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Target tracking schema context layer not found.")
    
    # Clean synchronous structural data assignment
    profile.fullName = payload.fullName
    profile.email = payload.email
    profile.headline = payload.identity.headline
    profile.workExperience = payload.identity.workExperience
    profile.educationCertifications = payload.identity.educationCertifications
    profile.skillsInventory = payload.identity.skillsInventory
    profile.openToWorkStatus = payload.preferences.openToWorkStatus
    profile.desiredTitles = payload.preferences.desiredTitles
    profile.desiredLocations = payload.preferences.desiredLocations
    profile.jobTypes = payload.preferences.jobTypes
    profile.profileVisibility = payload.privacy.profileVisibility
    profile.autoShareResume = payload.privacy.autoShareResume
    profile.storedResumes = payload.applications.storedResumes
    profile.applicationTracker = payload.applications.applicationTracker
    profile.jobAlerts = payload.alerts.jobAlerts

    db.commit()
    return {"status": "SUCCESS", "message": "Ecosystem Master Profile synchronized to disk persistence."}









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
            "tags": [t.strip() for t in row.tags.split(",") if t] if row.tags else [],
            # FIX: Fallback value if row.description is null/absent in existing rows
            "description": row.description if row.description else "No description provided.",
            "likes": row.likes if row.likes is not None else 0
        })
    return results

@app.post("/api/jobs/{job_id}/like")
def like_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job matrix node not found")
    job.likes += 1
    db.commit()
    return {"status": "SUCCESS", "likes": job.likes}

@app.post("/api/jobs/apply")
def apply_job(payload: ApplicationCreate, current_user: dict = Depends(decode_token), db: Session = Depends(get_db)):

    print("appplied")
    if current_user["role"] != "seeker":
        raise HTTPException(status_code=403, detail="Only seekers can apply to open positions.")
    
    job = db.query(JobModel).filter(JobModel.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Target job node missing.")

    new_app = ApplicationModel(
        job_id=payload.job_id,
        job_title=job.title,
        seeker_email=current_user["email"],
        cover_letter=payload.cover_letter,
        status="Pending"
    )
    db.add(new_app)
    db.commit()
    return {"status": "SUCCESS", "message": "Application piped into recruiter timeline matrix."}

@app.get("/api/recruiter/applications")
def get_recruiter_applications(current_user: dict = Depends(decode_token), db: Session = Depends(get_db)):
    if current_user["role"] != "recruiter":
        raise HTTPException(status_code=403, detail="Unauthorized metrics view.")
    
    apps = db.query(ApplicationModel).all()
    # Maps backend snake_case properties to frontend camelCase keys dynamically
    return [
        {
            "id": str(a.id),
            "jobId": str(a.job_id),
            "jobTitle": a.job_title,
            "seekerEmail": a.seeker_email,
            "coverLetter": a.cover_letter,
            "status": a.status,
            "appliedAt": "Recently"
        }
        for a in apps
    ]

@app.patch("/api/applications/{app_id}/status")
def update_application_status(app_id: int, payload: dict, current_user: dict = Depends(decode_token), db: Session = Depends(get_db)):
    if current_user["role"] != "recruiter":
        raise HTTPException(status_code=403, detail="Unauthorized metrics modification.")
    
    application = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Target tracking application profile node not found.")
    
    new_status = payload.get("status")
    if new_status not in ["Shortlisted", "Rejected", "Pending"]:
        raise HTTPException(status_code=400, detail="Invalid status assignment framework.")
        
    application.status = new_status
    db.commit()
    return {"status": "SUCCESS", "message": f"Application status configured to {new_status}."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)