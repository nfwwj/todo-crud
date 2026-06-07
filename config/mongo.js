export const config = {
  server: {
    port: process.env.PORT
  },
  mongodb: {
    uri: process.env.MONGO_URI,
    options: {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 3000
    }
  },
  session: {
  
  }
};
