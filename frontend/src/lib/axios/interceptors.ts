import axiosInstance from './instance'
import { createClient } from '@/lib/supabase/client'

// 요청 인터셉터: Supabase 토큰 자동 주입
axiosInstance.interceptors.request.use(
  async (config) => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터: 401 시 토큰 갱신 후 재시도
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const supabase = createClient()
      const { data, error: refreshError } = await supabase.auth.refreshSession()

      if (!refreshError && data.session) {
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`
        return axiosInstance(originalRequest)
      }

      // 토큰 갱신 실패 시 로그인 페이지로 이동
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
