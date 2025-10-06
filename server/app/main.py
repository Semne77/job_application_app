from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, resumes, jobs, analysis, answers, applications, users

app = FastAPI(title=settings.APP_NAME)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(
        content=b"\x00\x00\x01\x00\x01\x00\x10\x10\x10\x00\x01\x00\x04\x00"
                b"\x28\x01\x00\x00" + b"\x00"*296,
        media_type="image/x-icon"
    )

@app.get("/")
async def root():
    return {"ok": True, "app": settings.APP_NAME}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Mount API routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(resumes.router, prefix=settings.API_PREFIX)
app.include_router(jobs.router, prefix=settings.API_PREFIX)
app.include_router(analysis.router, prefix=settings.API_PREFIX)
app.include_router(answers.router, prefix=settings.API_PREFIX)
app.include_router(applications.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)  # ← add include

