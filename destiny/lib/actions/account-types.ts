export type AccountState = {
  error: string | null;
  message: string | null;
};

export const initialAccountState: AccountState = { error: null, message: null };
