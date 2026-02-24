-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "side" TEXT NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "liveUrl" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "resumePath" TEXT NOT NULL DEFAULT '/resume/Resume.pdf',

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- Insert default settings row
INSERT INTO "settings" ("id", "resumePath") VALUES (1, '/resume/Resume.pdf');
