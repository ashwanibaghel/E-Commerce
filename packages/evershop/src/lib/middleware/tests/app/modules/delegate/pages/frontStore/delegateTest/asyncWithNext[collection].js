export default async (request, response, next) => {
  await Promise.resolve();
  next();
};
