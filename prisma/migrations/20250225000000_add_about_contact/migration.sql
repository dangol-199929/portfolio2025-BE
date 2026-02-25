-- CreateTable
CREATE TABLE "about" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "education" TEXT NOT NULL DEFAULT '',
    "availability" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '[]',
    "image" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "about_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "items" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- Insert default about row
INSERT INTO "about" ("id", "name", "email", "education", "availability", "bio", "image") VALUES (1, '', '', '', '', '[]', '');

-- Insert default contact row
INSERT INTO "contact" ("id", "items") VALUES (1, '[]');
