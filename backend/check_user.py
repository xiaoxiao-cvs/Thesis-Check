import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import verify_password

async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == 'admin'))
        user = result.scalar_one_or_none()
        
        print('===== 数据库用户检查 =====')
        print('用户存在:', user is not None)
        
        if user:
            print('用户名:', user.username)
            print('邮箱:', user.email)
            print('角色:', user.role)
            print('密码哈希:', user.password[:60], '...')
            print('验证 admin123:', verify_password('admin123', user.password))
            print('验证 admin:', verify_password('admin', user.password))
        else:
            print('❌ admin 用户不存在！')

if __name__ == '__main__':
    asyncio.run(check())
