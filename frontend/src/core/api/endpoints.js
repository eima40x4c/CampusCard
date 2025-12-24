export const endpoints = {
  auth: {
    login: "/api/login",
    signup: "/api/signup",
  },
  profile: {
    me: "/api/profile",
    photo: "/api/profile/photo",
  },
  admin: {
    stats: "/api/admin/dashboard/stats",
    pending: "/api/admin/users/pending", // GET
    users: "/api/admin/users",           // GET (All users)
    userDetail: "/api/admin/users",      // GET /{id}
    approveReject: "/api/admin/users/approve-reject", // POST
    sendVerification: "/api/admin/users", // POST /{id}/send-verification
    verifyEmail: "/api/admin/users",      // POST /{id}/verify-email/{token}
  },
};