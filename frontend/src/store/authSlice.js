import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, getCurrentUser, logout as logoutApi } from '@/api/auth';
import { setToken, removeToken } from '@/utils/auth';

// 异步登录
export const login = createAsyncThunk('auth/login', async (credentials) => {
  const response = await loginApi(credentials);
  setToken(response.access_token);
  return response;
});

// 异步获取当前用户信息
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  const response = await getCurrentUser();
  return response;
});

// 异步登出
export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutApi();
  removeToken();
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 获取当前用户
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 登出
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
