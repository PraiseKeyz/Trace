-- CreateTable
CREATE TABLE "vouches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "voucher_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "message" TEXT,
    "weight" DECIMAL(4,2) NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vouches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vouches_voucher_id_recipient_id_key" ON "vouches"("voucher_id", "recipient_id");

-- AddForeignKey
ALTER TABLE "vouches" ADD CONSTRAINT "vouches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouches" ADD CONSTRAINT "vouches_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
