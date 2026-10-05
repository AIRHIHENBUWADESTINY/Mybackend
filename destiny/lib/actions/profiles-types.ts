export type ProfileState = {
  error: string | null;
  message: string | null;
};

export const initialProfileState: ProfileState = { error: null, message: null };
