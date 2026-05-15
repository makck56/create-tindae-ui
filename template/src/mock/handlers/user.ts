import { http, HttpResponse } from 'msw'
import { users, addUser, updateUser, deleteUser } from '../data/user'
import type { User } from '@/pages/user-management/features/user/models/User'

function paginate(list: User[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return list.slice(start, start + pageSize)
}

export const userHandlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const name = url.searchParams.get('name')?.toLowerCase()
    const status = url.searchParams.get('status')
    const role = url.searchParams.get('role')

    let filtered = [...users]

    if (name) {
      filtered = filtered.filter(u => u.name.toLowerCase().includes(name))
    }
    if (status) {
      filtered = filtered.filter(u => u.status === status)
    }
    if (role) {
      filtered = filtered.filter(u => u.role === role)
    }

    const total = filtered.length
    const list = paginate(filtered, page, pageSize)

    return HttpResponse.json({
      code: 0,
      data: { list, total },
    })
  }),

  http.get('/api/users/:id', ({ params }) => {
    const user = users.find(u => u.id === params.id)
    if (!user) {
      return HttpResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }
    return HttpResponse.json({ code: 0, data: user })
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as Omit<User, 'id' | 'createdAt'>
    const user = addUser(body)
    return HttpResponse.json({ code: 0, data: user })
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<User>
    const user = updateUser(params.id as string, body)
    if (!user) {
      return HttpResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }
    return HttpResponse.json({ code: 0, data: user })
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const ok = deleteUser(params.id as string)
    if (!ok) {
      return HttpResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }
    return HttpResponse.json({ code: 0 })
  }),
]
