import "dotenv/config";
import app from "./app";

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required in production. Configure it via AWS Secrets Manager.",
  );
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
