import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash

async def reset_password():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == 'admin'))
        user = result.scalar_one_or_none()
        
        if user:
            # 重新生成密码哈希
            new_hash = get_password_hash('admin123')
            user.password = new_hash
            await db.commit()
            print('✅ admin 密码已重置为: admin123')
            print('新哈希值:', new_hash)
        else:
            print('❌ admin 用户不存在！')

if __name__ == '__main__':
    asyncio.run(reset_password())
