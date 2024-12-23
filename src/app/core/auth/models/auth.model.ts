import { User } from './user.model';

export type LoginModel = { username: string; password: string };
export type RegisterModel = LoginModel;

export type LoginResponseModel = {
  token: string;
  user: User;
};

export type MeResponseModel = {
  user: User;
};
