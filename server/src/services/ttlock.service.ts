import axios from 'axios';
import md5 from 'md5';

// Credenciales desde el archivo .env
const CLIENT_ID = process.env.TTLOCK_CLIENT_ID;
const CLIENT_SECRET = process.env.TTLOCK_CLIENT_SECRET;
const ADMIN_USERNAME = process.env.TTLOCK_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.TTLOCK_ADMIN_PASSWORD;

// URL oficial de Sciener
const API_TTLOCK = "https://api.sciener.com";

let accessToken: string | null = null;
let tokenExpiration: number = 0;

export const getTTLockToken = async (): Promise<string> => {
    if (accessToken && Date.now() < tokenExpiration) {
        return accessToken;
    }

    try {
        console.log("🔄 Autenticando con TTLock API...");
        
        const passwordMd5 = md5(ADMIN_PASSWORD as string);

        const response = await axios.post(
            `${API_TTLOCK}/oauth2/token`,
            new URLSearchParams({
                client_id: CLIENT_ID as string,
                client_secret: CLIENT_SECRET as string,
                username: ADMIN_USERNAME as string,
                password: passwordMd5,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.data.access_token) {
            accessToken = response.data.access_token;
            tokenExpiration = Date.now() + (response.data.expires_in * 1000) - 60000;
            
            console.log("✅ Token TTLock renovado exitosamente");
            return accessToken as string;
        } else {
            throw new Error(`Error Auth TTLock: ${JSON.stringify(response.data)}`);
        }

    } catch (error) {
        console.error("❌ Error grave en servicio TTLock (Auth):", error);
        throw new Error("No se pudo conectar con el servicio de cerraduras.");
    }
};

export const generatePasscode = async (
    lockId: string,
    startTime: Date,
    endTime: Date
  ): Promise<string> => {
    
    // --- 🚨 ZONA DE SIMULACIÓN (MOCK) 🚨 ---
    if (lockId.startsWith("MOCK_")) {
        console.log(`⚠️ [SIMULACIÓN] Generando código falso para Lock: ${lockId}`);
        return "888888"; 
    }
    // ---------------------------------------

    try {
      const token = await getTTLockToken();
  
      // Convertimos las fechas a String porque URLSearchParams solo acepta textos
      const start = startTime.getTime().toString();
      const end = endTime.getTime().toString();
  
      console.log(`🔐 Generando código REAL para LockID: ${lockId}`);
  
      // 👇 CORRECCIÓN CLAVE: Usamos POST y URLSearchParams con todo en formato String
      const params = new URLSearchParams({
          clientId: CLIENT_ID as string,
          accessToken: token,
          lockId: lockId,
          keyboardPwdType: '3', 
          keyboardPwdVersion: '4', 
          startDate: start,
          endDate: end,
          date: Date.now().toString(),      
          addType: '2'             
      });

      const response = await axios.post(`${API_TTLOCK}/v3/keyboardPwd/get`, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
  
      // Verificamos si TTLock nos regresó un error (errcode 0 significa que todo salió perfecto)
      if (response.data.errcode !== 0 && response.data.errcode !== undefined) {
        throw new Error(`TTLock API Error [${response.data.errcode}]: ${response.data.errmsg}`);
      }
  
      // ¡Éxito real!
      console.log("✅ Código real generado:", response.data.keyboardPwd);
      return response.data.keyboardPwd;
  
    } catch (error) {
      console.error("❌ Error generando passcode:", error);
      throw new Error("Error al generar el código de la cerradura inteligente.");
    }
};