const KEY = "campuscard.session";

export const authStorage = {
  get() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(session) {
    localStorage.setItem(KEY, JSON.stringify(session));
  },

  clear() {
    localStorage.removeItem(KEY);
  },

  // ✅ الدوال الضرورية لمنع الشاشة البيضاء
  getToken() {
    const session = this.get();
    return session?.token;
  },

  getRole() {
    const session = this.get();
    return session?.role;
  },

  getUser() {
    const session = this.get();
    return session; 
  }
};