export type Session = {
  isLogin: boolean;
  username: string | null;
  token: string | null;
};

const emptySession: Session = { isLogin: false, username: null, token: null };

export function getSession(): Session {
  if (typeof window === "undefined") return emptySession;
  return {
    isLogin: localStorage.getItem("isLogin") === "true",
    username: localStorage.getItem("username"),
    token: localStorage.getItem("token"),
  };
}

export function setLoggedIn(username: string, token: string) {
  localStorage.setItem("isLogin", "true");
  localStorage.setItem("username", username);
  localStorage.setItem("token", token);
}

export function setLoggedOut() {
  localStorage.setItem("isLogin", "false");
  window.dispatchEvent(new Event("session-updated"));
}
