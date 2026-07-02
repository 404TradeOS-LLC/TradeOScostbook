export interface SignupInput {
  organizationName: string;
  regionCode?: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface SupabaseBootstrapInput {
  organizationName: string;
  regionCode?: string;
  authSubject: string;
  email: string;
  fullName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthSessionResult {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
  organization: {
    id: string;
    name: string;
  };
  role: string;
}
