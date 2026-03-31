export type LoginData = {
  email: string;
  password: string;
}

export type RegisterData = {
  name: string;
  email: string;
  password: string;
}

export type UpdateUserData = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export type AuthResponse = {
  success: boolean;
  token: string;
  user: User;
}