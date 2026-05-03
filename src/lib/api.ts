// 前端 API 客户端

const BASE_URL = ''

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: '请求失败' }))
    throw new Error(error.error || `请求失败 (${res.status})`)
  }

  return res.json()
}

// ========== 认证 ==========
export const authApi = {
  register: (data: { phone: string; password: string; nickname: string; school?: string; email?: string }) =>
    request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { phone: string; password: string }) =>
    request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ========== 商户 ==========
export const merchantApi = {
  list: (params?: {
    category?: string
    sort?: string
    q?: string
    page?: number
    pageSize?: number
  }) => {
    const sp = new URLSearchParams()
    if (params?.category) sp.set('category', params.category)
    if (params?.sort) sp.set('sort', params.sort)
    if (params?.q) sp.set('q', params.q)
    if (params?.page) sp.set('page', String(params.page))
    if (params?.pageSize) sp.set('pageSize', String(params.pageSize))
    return request<{
      merchants: any[]
      total: number
      page: number
      totalPages: number
    }>(`/api/merchants?${sp}`)
  },

  detail: (id: string) => request<any>(`/api/merchants/${id}`),
}

// ========== 评价 ==========
export const reviewApi = {
  list: (params?: {
    merchantId?: string
    userId?: string
    sort?: string
    filter?: string
    page?: number
  }) => {
    const sp = new URLSearchParams()
    if (params?.merchantId) sp.set('merchantId', params.merchantId)
    if (params?.userId) sp.set('userId', params.userId)
    if (params?.sort) sp.set('sort', params.sort)
    if (params?.filter) sp.set('filter', params.filter)
    if (params?.page) sp.set('page', String(params.page))
    return request<{
      reviews: any[]
      total: number
      page: number
      totalPages: number
    }>(`/api/reviews?${sp}`)
  },

  create: (data: {
    merchantId: string
    ratings: { taste: number; hygiene: number; service: number; value: number; portion: number }
    content: string
    images?: string[]
    videoUrl?: string
    deviceHash?: string
  }) =>
    request<any>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  detail: (id: string) => request<any>(`/api/reviews/${id}`),

  like: (id: string) =>
    request<{ liked: boolean; likes: number }>(`/api/reviews/${id}/like`, {
      method: 'POST',
    }),

  reply: (id: string, content: string) =>
    request<any>(`/api/reviews/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
}

// ========== 用户 ==========
export const userApi = {
  profile: () => request<any>('/api/user/profile'),

  updateProfile: (data: { nickname?: string; school?: string; preferences?: string[] }) =>
    request<any>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ========== 收藏 ==========
export const favoriteApi = {
  list: (group?: string) => {
    const sp = new URLSearchParams()
    if (group) sp.set('group', group)
    return request<any[]>(`/api/favorites?${sp}`)
  },

  toggle: (merchantId: string, groupName?: string) =>
    request<{ favorited: boolean }>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ merchantId, groupName }),
    }),
}
