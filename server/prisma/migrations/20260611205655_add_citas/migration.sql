-- CreateTable
CREATE TABLE "Cita" (
    "id" SERIAL NOT NULL,
    "clienta_id" INTEGER,
    "titulo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_clienta_id_fkey" FOREIGN KEY ("clienta_id") REFERENCES "Clienta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
