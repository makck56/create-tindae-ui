import type { User } from '@/pages/user-management/features/user/models/User';

let nextId = 30;

const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
const lastNames = [
  '伟',
  '芳',
  '娜',
  '敏',
  '静',
  '磊',
  '洋',
  '勇',
  '艳',
  '杰',
  '军',
  '强',
  '丽',
  '明',
  '超',
];

function randomName() {
  return (
    firstNames[Math.floor(Math.random() * firstNames.length)] +
    lastNames[Math.floor(Math.random() * lastNames.length)]
  );
}

function randomEmail(name: string) {
  const pinyin = ['zhang', 'li', 'wang', 'liu', 'chen', 'yang', 'zhao', 'huang', 'zhou', 'wu'];
  const idx = firstNames.indexOf(name[0]);
  const prefix = idx >= 0 ? pinyin[idx] : 'user';
  return `${prefix}${Math.floor(Math.random() * 1000)}@example.com`;
}

export function createUsers(count: number): User[] {
  const users: User[] = [];
  for (let i = 1; i <= count; i++) {
    const name = randomName();
    users.push({
      id: String(i),
      name,
      email: randomEmail(name),
      role: i <= 3 ? 'admin' : 'user',
      status: i === 5 || i === 12 ? 'inactive' : 'active',
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
        .toISOString()
        .split('T')[0],
    });
  }
  return users;
}

export let users = createUsers(nextId);

export function resetUsers() {
  nextId = 30;
  users = createUsers(nextId);
}

export function addUser(data: Omit<User, 'id' | 'createdAt'>): User {
  const user: User = {
    ...data,
    id: String(++nextId),
    createdAt: new Date().toISOString().split('T')[0],
  };
  users.unshift(user);
  return user;
}

export function updateUser(id: string, data: Partial<User>): User | undefined {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...data };
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}
