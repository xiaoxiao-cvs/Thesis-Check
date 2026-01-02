# 启动后端服务

# 激活虚拟环境（如果使用）
# python -m venv venv
# .\venv\Scripts\Activate.ps1

# 安装依赖
Write-Host "正在安装依赖..." -ForegroundColor Green
pip install -r requirements.txt

# 启动服务
Write-Host "`n正在启动服务..." -ForegroundColor Green
Write-Host "API文档: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "ReDoc: http://localhost:8000/redoc`n" -ForegroundColor Cyan

python app/main.py
