from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from bson import ObjectId
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Skilling in a Box API", version="1.0.0")

# CORS - Allow all origins for cross-domain requests
# Note: Using allow_origin_regex to allow any origin while supporting credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://user-mgmt.preview.emergentagent.com",
        "https://user-mgmt.emergent.host",
        "https://box.mslevelup.com",
        "https://*.mslevelup.com",
        "https://*.emergentagent.com",
        "https://*.emergent.host",
    ],
    allow_origin_regex=r"https://.*\.(mslevelup\.com|emergentagent\.com|emergent\.host)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# MongoDB
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/skillingbox")
client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client.skillingbox

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT = os.getenv("AZURE_STORAGE_ACCOUNT")
AZURE_STORAGE_KEY = os.getenv("AZURE_STORAGE_KEY")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME", "skilling-content")

blob_service_client = None
container_client = None

try:
    connection_string = f"DefaultEndpointsProtocol=https;AccountName={AZURE_STORAGE_ACCOUNT};AccountKey={AZURE_STORAGE_KEY};EndpointSuffix=core.windows.net"
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
    if not container_client.exists():
        container_client.create_container()
except Exception as e:
    print(f"Azure Blob Storage connection error: {e}")

# JWT Config
JWT_SECRET = os.getenv("JWT_SECRET", "skillingbox_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Enums as lists
SOLUTION_AREAS = [
    "AI Business Solutions (ABS)",
    "Azure - Cloud & AI Platform",
    "Security"
]

SOLUTION_PLAYS = [
    "AI Business Process",
    "AI Workforce",
    "Innovate with Azure AI Apps and Agents",
    "Migrate and Modernize Your estate",
    "Unify Your Data Platform",
    "Data Security",
    "Modern SecOps with Unified Platform"
]

COURSE_TYPES = [
    "Tech Deal Ready",
    "Sales Ready",
    "Project Ready",
    "Project Ready with Labs",
    "Credential Ready"
]

LEVELS = ["Beginner", "Intermediate", "Advanced"]

LANGUAGES = [
    "English (US)", "中文 (简体字)", "Deutsch", "Español",
    "Français", "Italiano", "日本語", "한국어", "Português", "中文 (繁體字)"
]

ROLES = ["Technical", "Sales", "Pre-Sales", "Project Ready"]

CONTENT_CATEGORIES = ["GPS Solution Areas", "Event-based content"]

FILE_TYPES = [
    "Trainer Presentation (PPTX)",
    "Change Log (PDF)",
    "Train the Trainer Guide (PDF)",
    "Video Recording (MP4)",
    "Caption File (VTT/SRT)",
    "Lab Guide (Word/PDF)",
    "Lab Files (ZIP)"
]

USER_ROLES = ["admin", "content_admin", "training_partner", "ms_stakeholder"]

PARTNER_TYPES = ["CSP", "ESI", "MPL", "GSI"]

ACCESS_REQUEST_STATUS = ["pending", "approved", "rejected"]

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization: str
    domain: Optional[str] = None
    role: str = "training_partner"
    partner_type: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    organization: str
    domain: Optional[str]
    role: str
    partner_type: Optional[str] = None
    is_approved: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    solution_area: str
    solution_play: Optional[str] = None
    course_type: str
    level: str
    language: str
    target_role: str
    target_audience: str
    duration: str
    certification_course: bool = False
    hands_on_lab: bool = False
    multilingual_audio: bool = False

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    solution_area: Optional[str] = None
    solution_play: Optional[str] = None
    course_type: Optional[str] = None
    level: Optional[str] = None
    language: Optional[str] = None
    target_role: Optional[str] = None
    target_audience: Optional[str] = None
    duration: Optional[str] = None
    certification_course: Optional[bool] = None
    hands_on_lab: Optional[bool] = None
    multilingual_audio: Optional[bool] = None

class AccessRequest(BaseModel):
    course_id: str
    reason: str

class AccessRequestUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class ExecutionSchedule(BaseModel):
    course_id: str
    execution_date: datetime
    location: str
    expected_attendees: int
    notes: Optional[str] = None

class AttendanceData(BaseModel):
    execution_id: str
    actual_attendees: int
    completion_rate: float
    feedback_summary: Optional[str] = None
    learner_details: Optional[List[dict]] = None

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.users.find_one({"_id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(allowed_roles: List[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

def generate_sas_url(blob_name: str, expiry_hours: int = 24) -> str:
    if not blob_service_client:
        return None
    sas_token = generate_blob_sas(
        account_name=AZURE_STORAGE_ACCOUNT,
        container_name=AZURE_CONTAINER_NAME,
        blob_name=blob_name,
        account_key=AZURE_STORAGE_KEY,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
    )
    return f"https://{AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/{AZURE_CONTAINER_NAME}/{blob_name}?{sas_token}"

# Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Auth Routes
@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    try:
        existing = db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = str(uuid.uuid4())
        domain = user_data.email.split("@")[1] if "@" in user_data.email else None
        
        user = {
            "_id": user_id,
            "email": user_data.email,
            "password": hash_password(user_data.password),
            "full_name": user_data.full_name,
            "organization": user_data.organization,
            "domain": domain,
            "role": user_data.role if user_data.role in USER_ROLES else "training_partner",
            "partner_type": user_data.partner_type,
            "is_approved": user_data.role == "admin",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        db.users.insert_one(user)
        
        token = create_access_token({"sub": user_id})
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse(
                id=user_id,
                email=user["email"],
                full_name=user["full_name"],
                organization=user["organization"],
                domain=user["domain"],
                role=user["role"],
                partner_type=user.get("partner_type"),
                is_approved=user["is_approved"],
                created_at=user["created_at"]
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error. Please try again later.")

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    try:
        user = db.users.find_one({"email": credentials.email})
        if not user or not verify_password(credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = create_access_token({"sub": user["_id"]})
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse(
                id=user["_id"],
                email=user["email"],
                full_name=user["full_name"],
                organization=user["organization"],
                domain=user.get("domain"),
                role=user["role"],
                partner_type=user.get("partner_type"),
                is_approved=user["is_approved"],
                created_at=user["created_at"]
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error. Please try again later.")

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["_id"],
        email=user["email"],
        full_name=user["full_name"],
        organization=user["organization"],
        domain=user.get("domain"),
        role=user["role"],
        is_approved=user["is_approved"],
        created_at=user["created_at"]
    )

# Metadata Routes
@app.get("/api/metadata")
async def get_metadata():
    return {
        "solution_areas": SOLUTION_AREAS,
        "solution_plays": SOLUTION_PLAYS,
        "course_types": COURSE_TYPES,
        "levels": LEVELS,
        "languages": LANGUAGES,
        "roles": ROLES,
        "content_categories": CONTENT_CATEGORIES,
        "file_types": FILE_TYPES,
        "user_roles": USER_ROLES
    }

# Course Routes
@app.post("/api/courses")
async def create_course(
    course_data: CourseCreate,
    user: dict = Depends(require_role(["admin", "content_admin"]))
):
    course_id = str(uuid.uuid4())
    course = {
        "_id": course_id,
        **course_data.dict(),
        "files": [],
        "version": "1.0",
        "version_history": [],
        "created_by": user["_id"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }
    db.courses.insert_one(course)
    return {"id": course_id, "message": "Course created successfully"}

@app.get("/api/courses")
async def get_courses(
    category: Optional[str] = None,
    solution_area: Optional[str] = None,
    solution_play: Optional[str] = None,
    course_type: Optional[str] = None,
    level: Optional[str] = None,
    language: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    query = {"is_active": True}
    
    if category:
        query["category"] = category
    if solution_area:
        query["solution_area"] = solution_area
    if solution_play:
        query["solution_play"] = solution_play
    if course_type:
        query["course_type"] = course_type
    if level:
        query["level"] = level
    if language:
        query["language"] = language
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    total = db.courses.count_documents(query)
    courses = list(db.courses.find(query).skip((page - 1) * limit).limit(limit))
    
    for course in courses:
        course["id"] = course.pop("_id")
    
    return {
        "courses": courses,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@app.get("/api/courses/{course_id}")
async def get_course(course_id: str):
    course = db.courses.find_one({"_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course["id"] = course.pop("_id")
    return course

@app.put("/api/courses/{course_id}")
async def update_course(
    course_id: str,
    course_data: CourseUpdate,
    user: dict = Depends(require_role(["admin", "content_admin"]))
):
    course = db.courses.find_one({"_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = {k: v for k, v in course_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    db.courses.update_one({"_id": course_id}, {"$set": update_data})
    return {"message": "Course updated successfully"}

@app.delete("/api/courses/{course_id}")
async def delete_course(
    course_id: str,
    user: dict = Depends(require_role(["admin", "content_admin"]))
):
    result = db.courses.update_one(
        {"_id": course_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

# File Upload Routes
@app.post("/api/courses/{course_id}/files")
async def upload_course_file(
    course_id: str,
    file: UploadFile = File(...),
    file_type: str = Form(...),
    user: dict = Depends(require_role(["admin", "content_admin"]))
):
    course = db.courses.find_one({"_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if not container_client:
        raise HTTPException(status_code=500, detail="Azure storage not configured")
    
    file_id = str(uuid.uuid4())
    file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
    blob_name = f"courses/{course_id}/{file_id}.{file_ext}"
    
    content = await file.read()
    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(content, overwrite=True)
    
    file_info = {
        "id": file_id,
        "original_name": file.filename,
        "blob_name": blob_name,
        "file_type": file_type,
        "size": len(content),
        "uploaded_by": user["_id"],
        "uploaded_at": datetime.utcnow()
    }
    
    db.courses.update_one(
        {"_id": course_id},
        {
            "$push": {"files": file_info},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {"file_id": file_id, "message": "File uploaded successfully"}

@app.get("/api/courses/{course_id}/files/{file_id}/download")
async def download_course_file(
    course_id: str,
    file_id: str,
    user: dict = Depends(get_current_user)
):
    # Portal-level access: user must be approved to download any content
    if user["role"] == "training_partner" and not user.get("is_approved"):
        raise HTTPException(status_code=403, detail="Your portal access is pending approval")
    
    course = db.courses.find_one({"_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    file_info = next((f for f in course.get("files", []) if f["id"] == file_id), None)
    if not file_info:
        raise HTTPException(status_code=404, detail="File not found")
    
    download_url = generate_sas_url(file_info["blob_name"])
    if not download_url:
        raise HTTPException(status_code=500, detail="Could not generate download URL")
    
    # Log download
    db.download_logs.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "course_id": course_id,
        "file_id": file_id,
        "downloaded_at": datetime.utcnow()
    })
    
    return {"download_url": download_url, "filename": file_info["original_name"]}

@app.delete("/api/courses/{course_id}/files/{file_id}")
async def delete_course_file(
    course_id: str,
    file_id: str,
    user: dict = Depends(require_role(["admin", "content_admin"]))
):
    course = db.courses.find_one({"_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    file_info = next((f for f in course.get("files", []) if f["id"] == file_id), None)
    if not file_info:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete from Azure
    if container_client:
        blob_client = container_client.get_blob_client(file_info["blob_name"])
        blob_client.delete_blob()
    
    db.courses.update_one(
        {"_id": course_id},
        {
            "$pull": {"files": {"id": file_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {"message": "File deleted successfully"}

# Access Request Routes
@app.post("/api/access-requests")
async def create_access_request(
    request_data: AccessRequest,
    user: dict = Depends(get_current_user)
):
    if user["role"] != "training_partner":
        raise HTTPException(status_code=400, detail="Only training partners can request access")
    
    existing = db.access_requests.find_one({
        "user_id": user["_id"],
        "course_id": request_data.course_id,
        "status": {"$in": ["pending", "approved"]}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Access request already exists")
    
    request_id = str(uuid.uuid4())
    access_request = {
        "_id": request_id,
        "user_id": user["_id"],
        "user_email": user["email"],
        "user_name": user["full_name"],
        "organization": user["organization"],
        "course_id": request_data.course_id,
        "reason": request_data.reason,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    db.access_requests.insert_one(access_request)
    return {"id": request_id, "message": "Access request submitted"}

@app.get("/api/access-requests")
async def get_access_requests(
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    
    if user["role"] == "training_partner":
        query["user_id"] = user["_id"]
    elif user["role"] not in ["admin", "ms_stakeholder"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    if status:
        query["status"] = status
    
    requests = list(db.access_requests.find(query).sort("created_at", -1))
    
    for req in requests:
        req["id"] = req.pop("_id")
        course = db.courses.find_one({"_id": req["course_id"]})
        req["course_title"] = course["title"] if course else "Unknown"
    
    return requests

@app.put("/api/access-requests/{request_id}")
async def update_access_request(
    request_id: str,
    update_data: AccessRequestUpdate,
    user: dict = Depends(require_role(["admin", "ms_stakeholder"]))
):
    if update_data.status not in ACCESS_REQUEST_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = db.access_requests.update_one(
        {"_id": request_id},
        {
            "$set": {
                "status": update_data.status,
                "admin_notes": update_data.admin_notes,
                "reviewed_by": user["_id"],
                "reviewed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return {"message": f"Access request {update_data.status}"}

# Execution Schedule Routes (Training Partner)
@app.post("/api/executions")
async def create_execution_schedule(
    schedule_data: ExecutionSchedule,
    user: dict = Depends(require_role(["training_partner"]))
):
    # Check if user has access to the course
    access = db.access_requests.find_one({
        "user_id": user["_id"],
        "course_id": schedule_data.course_id,
        "status": "approved"
    })
    if not access:
        raise HTTPException(status_code=403, detail="No access to this course")
    
    execution_id = str(uuid.uuid4())
    execution = {
        "_id": execution_id,
        "user_id": user["_id"],
        "organization": user["organization"],
        **schedule_data.dict(),
        "status": "scheduled",
        "attendance_submitted": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    db.executions.insert_one(execution)
    return {"id": execution_id, "message": "Execution schedule created"}

@app.get("/api/executions")
async def get_executions(
    user: dict = Depends(get_current_user)
):
    query = {}
    if user["role"] == "training_partner":
        query["user_id"] = user["_id"]
    elif user["role"] not in ["admin", "ms_stakeholder"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    executions = list(db.executions.find(query).sort("execution_date", -1))
    
    for exe in executions:
        exe["id"] = exe.pop("_id")
        course = db.courses.find_one({"_id": exe["course_id"]})
        exe["course_title"] = course["title"] if course else "Unknown"
    
    return executions

@app.post("/api/executions/{execution_id}/attendance")
async def submit_attendance(
    execution_id: str,
    attendance_data: AttendanceData,
    user: dict = Depends(require_role(["training_partner"]))
):
    execution = db.executions.find_one({"_id": execution_id})
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    if execution["user_id"] != user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.executions.update_one(
        {"_id": execution_id},
        {
            "$set": {
                "actual_attendees": attendance_data.actual_attendees,
                "completion_rate": attendance_data.completion_rate,
                "feedback_summary": attendance_data.feedback_summary,
                "learner_details": attendance_data.learner_details,
                "attendance_submitted": True,
                "attendance_submitted_at": datetime.utcnow(),
                "status": "completed",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Attendance data submitted successfully"}

# User Management Routes (Admin)
@app.get("/api/users")
async def get_users(
    role: Optional[str] = None,
    user: dict = Depends(require_role(["admin", "ms_stakeholder"]))
):
    query = {}
    if role:
        query["role"] = role
    
    users = list(db.users.find(query, {"password": 0}).sort("created_at", -1))
    for u in users:
        u["id"] = u.pop("_id")
    
    return users

@app.put("/api/users/{user_id}/approve")
async def approve_user(
    user_id: str,
    user: dict = Depends(require_role(["admin"]))
):
    result = db.users.update_one(
        {"_id": user_id},
        {"$set": {"is_approved": True, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User approved"}

@app.put("/api/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str = Query(...),
    user: dict = Depends(require_role(["admin"]))
):
    if role not in USER_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = db.users.update_one(
        {"_id": user_id},
        {"$set": {"role": role, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User role updated"}

# Analytics Routes (MS Stakeholder)
@app.get("/api/analytics/overview")
async def get_analytics_overview(
    user: dict = Depends(require_role(["admin", "ms_stakeholder"]))
):
    total_courses = db.courses.count_documents({"is_active": True})
    total_partners = db.users.count_documents({"role": "training_partner"})
    total_downloads = db.download_logs.count_documents({})
    total_executions = db.executions.count_documents({})
    total_learners = 0
    
    # Calculate total trained learners
    pipeline = [
        {"$match": {"attendance_submitted": True}},
        {"$group": {"_id": None, "total": {"$sum": "$actual_attendees"}}}
    ]
    result = list(db.executions.aggregate(pipeline))
    if result:
        total_learners = result[0]["total"]
    
    return {
        "total_courses": total_courses,
        "total_partners": total_partners,
        "total_downloads": total_downloads,
        "total_executions": total_executions,
        "total_trained_learners": total_learners
    }

@app.get("/api/analytics/downloads")
async def get_download_analytics(
    days: int = 30,
    user: dict = Depends(require_role(["admin", "ms_stakeholder"]))
):
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {"$match": {"downloaded_at": {"$gte": start_date}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$downloaded_at"}
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    downloads_by_date = list(db.download_logs.aggregate(pipeline))
    
    # Top downloaded courses
    course_pipeline = [
        {"$match": {"downloaded_at": {"$gte": start_date}}},
        {"$group": {"_id": "$course_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    
    top_courses = list(db.download_logs.aggregate(course_pipeline))
    for tc in top_courses:
        course = db.courses.find_one({"_id": tc["_id"]})
        tc["course_title"] = course["title"] if course else "Unknown"
    
    return {
        "downloads_by_date": downloads_by_date,
        "top_courses": top_courses
    }

@app.get("/api/analytics/learners")
async def get_learner_analytics(
    user: dict = Depends(require_role(["admin", "ms_stakeholder"]))
):
    # Learners by organization
    org_pipeline = [
        {"$match": {"attendance_submitted": True}},
        {
            "$group": {
                "_id": "$organization",
                "total_learners": {"$sum": "$actual_attendees"},
                "total_executions": {"$sum": 1},
                "avg_completion_rate": {"$avg": "$completion_rate"}
            }
        },
        {"$sort": {"total_learners": -1}}
    ]
    
    by_organization = list(db.executions.aggregate(org_pipeline))
    
    # Learners by course
    course_pipeline = [
        {"$match": {"attendance_submitted": True}},
        {
            "$group": {
                "_id": "$course_id",
                "total_learners": {"$sum": "$actual_attendees"},
                "total_executions": {"$sum": 1}
            }
        },
        {"$sort": {"total_learners": -1}},
        {"$limit": 10}
    ]
    
    by_course = list(db.executions.aggregate(course_pipeline))
    for bc in by_course:
        course = db.courses.find_one({"_id": bc["_id"]})
        bc["course_title"] = course["title"] if course else "Unknown"
    
    return {
        "by_organization": by_organization,
        "by_course": by_course
    }

# Seed admin user on startup
@app.on_event("startup")
async def startup_event():
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        print("MongoDB connection successful")
        
        admin = db.users.find_one({"email": "admin@skillingbox.com"})
        if not admin:
            admin_id = str(uuid.uuid4())
            db.users.insert_one({
                "_id": admin_id,
                "email": "admin@skillingbox.com",
                "password": hash_password("admin123"),
                "full_name": "System Admin",
                "organization": "Skilling Box",
                "domain": "skillingbox.com",
                "role": "admin",
                "is_approved": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            print("Admin user created: admin@skillingbox.com / admin123")
    except Exception as e:
        print(f"Startup warning - MongoDB operation failed: {e}")
        # Don't fail startup, let the app run and handle DB errors per-request

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
