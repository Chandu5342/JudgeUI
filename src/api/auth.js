import client from './client';

export async function login(email, password) {
  const res = await client.post('/auth/login', { email, password });
  return res.data;
}

export async function register(data) {
  const res = await client.post('/auth/register', data);
  return res.data;
}

export async function verify() {
  const res = await client.get('/auth/verify');
  return res.data;
}
