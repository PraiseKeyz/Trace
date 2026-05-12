-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "password_hash" TEXT NOT NULL,
    "role" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "squad_customer_id" VARCHAR(255),
    "virtual_account_no" VARCHAR(50),
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferred_language" VARCHAR(20) DEFAULT 'en',
    "data_sharing_consent" BOOLEAN NOT NULL DEFAULT false,
    "otp_code" TEXT,
    "otp_expires_at" TIMESTAMP(3),
    "onboarding_complete" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economic_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "identity_score" INTEGER NOT NULL DEFAULT 0,
    "transaction_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "activity_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vouch_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "profile_completeness" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trade_category" VARCHAR(100),
    "years_active" INTEGER,
    "is_profile_verified" BOOLEAN NOT NULL DEFAULT false,
    "total_transaction_volume" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_transaction_count" INTEGER NOT NULL DEFAULT 0,
    "avg_monthly_volume" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "last_transaction_at" TIMESTAMP(3),
    "vouch_count" INTEGER NOT NULL DEFAULT 0,
    "verified_vouch_count" INTEGER NOT NULL DEFAULT 0,
    "risk_tier" VARCHAR(10) NOT NULL DEFAULT 'high',
    "is_finance_eligible" BOOLEAN NOT NULL DEFAULT false,
    "max_recommended_loan" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "last_active" TIMESTAMP(3),
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "economic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "economic_profiles_user_id_key" ON "economic_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "economic_profiles" ADD CONSTRAINT "economic_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
