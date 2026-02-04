import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface TermsData {
  template: string;
  additionalClauses: string;
  privacyOptions: {
    collectEmail: boolean;
    shareData: boolean;
    cctvNotice: boolean;
    cookieConsent: boolean;
  };
}

// API to fetch terms - replace with your actual endpoint
const api = {
  async fetchTerms(): Promise<TermsData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      template: `1. **Aceptación del Servicio** Al realizar una reserva o acceder a nuestras instalaciones, confirmas que has leído y aceptado estos términos. El servicio consiste en el uso temporal de la sala de juntas y sus amenidades exclusivas durante el periodo contratado.

2. **Reservas y Pagos**
   **Confirmación:** Tu reserva solo se considera confirmada una vez que el pago ha sido acreditado en su totalidad.
   
   **Tarifas:** Los precios vigentes, impuestos y cargos adicionales son los mostrados en la plataforma al momento de reservar. .MEET puede ajustar los precios futuros sin previo aviso, respetando siempre las reservas que ya hayan sido pagadas.
   
   **Horarios:** La duración, tolerancia y bloques de tiempo se rigen estrictamente por lo seleccionado en tu reserva.

3. **Cancelaciones y "No Show"** Las políticas de reembolso y tiempos límite para cancelar son las publicadas en nuestra plataforma al momento de tu compra. Si no te presentas a tu reserva (No Show) sin haber cancelado en tiempo y forma, perderás el monto total pagado sin derecho a reembolso.

4. **Acceso y Seguridad**
   **Código Personal:** El acceso a la sala es mediante un código digital temporal. Este código es personal e intransferible. Tú eres el único responsable del uso que se le dé a dicho código.
   
   **Videovigilancia:** Por tu seguridad y control operativo, aceptas que el inmueble cuenta con sistemas de grabación (CCTV) activos.

5. **Responsabilidad del Usuario**
   **Uso del Espacio:** Te comprometes a usar la sala exclusivamente para fines profesionales (juntas, capacitaciones, trabajo). Queda prohibido cualquier uso ilícito, peligroso o que atente contra la moral.
   
   **Invitados:** Como titular de la reserva, eres responsable de la conducta de tus acompañantes dentro de las instalaciones.
   
   **Datos:** Garantizas que la información que nos proporcionas (nombre, contacto) es real y verificable.

6. **Daños y Limpieza** Eres responsable de cuidar el mobiliario y equipo. En caso de daños, desperfectos o suciedad excesiva causada por ti o tus invitados, autorizas a SPEC.MEET a realizar el cobro correspondiente por reparación, reposición o limpieza extraordinaria.

7. **Limitación de Responsabilidad** .MEET no se hace responsable por:
   
   Objetos personales olvidados, perdidos o robados dentro de la sala.
   
   Interrupciones de servicio por causas de fuerza mayor (fallas eléctricas generales, internet del proveedor externo, desastres naturales).

8. **Incumplimiento** .MEET se reserva el derecho de negar el acceso, suspender el servicio o solicitar el desalojo inmediato sin reembolso si detectamos un incumplimiento de estas normas o un mal uso de las instalaciones.

9. **Política de Alimentos y Bebidas** Para mantener la higiene y calidad del espacio para todos, está prohibido el ingreso de alimentos, así como el consumo de bebidas alcohólicas. Se permite únicamente el consumo de snacks secos, agua y café, siempre cuidando la limpieza del mobiliario.

10. **Aforo Máximo** La sala tiene una capacidad máxima de 10 personas. Por seguridad y confort, no se permite exceder este límite. En caso de sobrecupo, .MEET podrá cancelar la reserva de inmediato sin reembolso.

11. **Protocolo de Salida (Check-out)** Al finalizar tu reserva, eres responsable de dejar la sala lista para el siguiente usuario:
    
    Apagar el Aire Acondicionado y las Luces.
    
    Verificar que la puerta quede bien cerrada al salir.
    
    No dejar basura fuera de los cestos.
    
    El incumplimiento de esto (especialmente dejar el A/C encendido) podrá generar un cargo extra.

12. **Uso de Internet** La red WiFi es para uso profesional. Queda prohibido utilizarla para descargas ilegales, contenido para adultos o cualquier actividad que comprometa la seguridad digital de la red.

13. **Modificaciones y Jurisdicción** Podemos actualizar estos términos en cualquier momento; los cambios serán efectivos al publicarse en nuestra plataforma. Para cualquier controversia legal, nos regimos por las leyes vigentes en México y los tribunales competentes del domicilio del proveedor.
14. **Conducta**: Los usuarios deben mantener un comportamiento apropiado y respetuoso. SPEC.MEET se reserva el derecho de terminar el servicio sin reembolso en caso de conducta inapropiada.`,
      additionalClauses: `**Modificaciones**: SPEC.MEET se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación.

**Ley Aplicable**: Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa será resuelta en los tribunales competentes de Ciudad de México.`,
      privacyOptions: {
        collectEmail: true,
        shareData: false,
        cctvNotice: true,
        cookieConsent: true
      }
    };
  }
};

const TermsAndConditions: React.FC = () => {
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const data = await api.fetchTerms();
        setTermsData(data);
      } catch (err) {
        console.error('Error loading terms:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTerms();
  }, []);

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.trim() === '') {
        return <div key={index} className="h-4" />;
      }
      return (
        <p key={index} className="text-gray-800 text-[15px] leading-relaxed mb-4">
          {renderFormattedText(line)}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
      
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Simple Header - matching image style */}
        <div className="mb-12">
          <h1 className="text-2xl font-normal text-gray-900 tracking-[0.3em] text-center mb-3">
            TÉRMINOS Y CONDICIONES DE SERVICO .MEET
          </h1>
          <div className="w-36 h-[1px] bg-gray-300 mx-auto"></div>
        </div>
        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <div>
            <p className="text-gray-800 text-[15px] leading-relaxed mb-6">
              Al reservar, pagar o utilizar los espacios de .MEET, aceptas y te comprometes a cumplir los siguientes lineamientos de servicio y uso:
            </p>
          </div>

          {/* Main Terms */}
          {termsData && renderContent(termsData.template)}

          {/* Additional Clauses */}
          {termsData?.additionalClauses && (
            <div className="pt-8 mt-8 border-t border-gray-200">
              {renderContent(termsData.additionalClauses)}
            </div>
          )}

          {/* Privacy Section */}
          {termsData?.privacyOptions && (
            <div className="pt-8 mt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                Política de Privacidad
              </h2>
              
              <div className="space-y-3">
                {termsData.privacyOptions.collectEmail && (
                  <p className="text-gray-800 text-[15px] leading-relaxed">
                    • Recopilamos su dirección de correo electrónico para comunicaciones relacionadas con su reserva y, con su consentimiento, para enviarle información sobre nuestros servicios.
                  </p>
                )}
                
                {termsData.privacyOptions.shareData && (
                  <p className="text-gray-800 text-[15px] leading-relaxed">
                    • Compartimos datos anónimos y agregados para mejorar nuestros servicios y experiencia del usuario.
                  </p>
                )}
                
                {termsData.privacyOptions.cctvNotice && (
                  <p className="text-gray-800 text-[15px] leading-relaxed">
                    • Nuestras instalaciones cuentan con videovigilancia CCTV por razones de seguridad. Las grabaciones se mantienen de manera confidencial y se utilizan únicamente para fines de seguridad.
                  </p>
                )}
                
                {termsData.privacyOptions.cookieConsent && (
                  <p className="text-gray-800 text-[15px] leading-relaxed">
                    • Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Al continuar navegando, usted acepta el uso de cookies de acuerdo con nuestra política.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;