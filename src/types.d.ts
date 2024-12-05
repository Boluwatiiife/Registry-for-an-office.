declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      googleId: string;
      thumbnail: string;
    }
  }
}

export {};
