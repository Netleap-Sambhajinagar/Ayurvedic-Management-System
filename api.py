from fastapi import FastAPI
from backend import run_analysis
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vikriti Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/analyze-sheets")
def analyze_sheets():
    try:
        results = run_analysis()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
