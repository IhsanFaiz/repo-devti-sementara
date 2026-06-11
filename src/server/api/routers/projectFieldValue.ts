import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import fs from 'fs';
import path from 'path';

export const projectFieldValueRouter = createTRPCRouter({
  getByFieldId: protectedProcedure
    .input(
      yup.object({
        fieldId: yup.number().required()
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.projectFieldValue.findFirst({
        where: {
          fieldId: input.fieldId
        },

        include: {
          user: true,
          file: true
        }
      });
    }),

  create: protectedProcedure
    .input(
      yup.object({
        fieldId: yup.number().required(),

        value: yup.string().nullable().optional(),

        fileId: yup.number().nullable().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      let finalValue = input.value;

      // Cek apakah data teks yang masuk merupakan JSON stringified file Base64 dari Dropzone
      if (input.value && input.value.startsWith('{"fileName":')) {
        try {
          const { fileName, fileData } = JSON.parse(input.value);

          // 1. Ambil bagian setelah karakter ';base64,'
          const base64Part = fileData.split(';base64,').pop();

          if (!base64Part) {
            throw new Error('Format Base64 tidak valid.');
          }

          // PERBAIKAN: Bersihkan karakter escape (\n, \r, atau spasi) yang sering merusak struktur binary gambar
          const cleanBase64 = base64Part.replace(/[^A-Za-z0-9+/=]/g, '');

          const fileExtension = path.extname(fileName);
          const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}${fileExtension}`;

          const uploadDir = path.join(process.cwd(), 'public', 'uploads');

          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const fullPath = path.join(uploadDir, uniqueFileName);

          // 2. Tulis data yang sudah dibersihkan ke disk
          fs.writeFileSync(fullPath, cleanBase64, { encoding: 'base64' });

          finalValue = `/uploads/${uniqueFileName}`;
        } catch (error) {
          console.error('Detail error upload:', error);
          throw new Error('Gagal memproses dan menulis file unggahan ke server lokal.');
        }
      }

      const existing = await ctx.db.projectFieldValue.findFirst({
        where: {
          fieldId: input.fieldId
        }
      });

      if (existing) {
        return ctx.db.projectFieldValue.update({
          where: {
            id: existing.id
          },

          data: {
            value: finalValue, // Menggunakan nilai text biasa atau path file baru
            fileId: input.fileId,
            submittedAt: new Date()
          }
        });
      }

      return ctx.db.projectFieldValue.create({
        data: {
          fieldId: input.fieldId,
          value: finalValue, // Menggunakan nilai text biasa atau path file baru
          fileId: input.fileId
        }
      });
    }),

  delete: protectedProcedure
    .input(
      yup.object({
        id: yup.number().required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.projectFieldValue.delete({
        where: {
          id: input.id
        }
      });
    })
});
