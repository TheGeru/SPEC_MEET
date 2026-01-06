import {email, z} from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos  2 caracteres"),
    email: z.string().email("Formato de email invalido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object ({
    email: z.string().email(),
    password: z.string(),
})

export const roomSchema = z.object({
  name: z.string().min(3, "El nombre de la sala es muy corto"),
  wifi_ssid: z.string().min(1, "El nombre del WiFi (SSID) es obligatorio"),
  wifi_pass: z.string().min(1, "La contraseña del WiFi es obligatoria"),
  price_per_hour: z.number().positive("El precio debe ser un número positivo"),
  status: z.string().optional(),
})