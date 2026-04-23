import { LockKeyholeIcon, MailIcon } from "lucide-react";
import { ADDITIONAL_SERVICES, CONTACT_EMAIL } from "../models";

interface AdditionalServicesProps {
  userName: string;
}

export default function AdditionalServices({ userName }: AdditionalServicesProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-white/10">
        <h3 className="text-white font-medium text-sm">
          Servicios adicionales bajo solicitud
        </h3>
      </div>

      <div className="p-5 space-y-4">
        {ADDITIONAL_SERVICES.map((service) => {
          const body = service.emailBody.replace("Nombre: ", `Nombre: ${userName}`);
          const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(service.emailSubject)}&body=${encodeURIComponent(body)}`;

          return (
            <div
              key={service.id}
              className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="p-2.5 bg-amber-500/15 rounded-lg shrink-0">
                <LockKeyholeIcon className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm mb-1">{service.name}</h4>
                <p className="text-white/50 text-xs leading-relaxed mb-3">
                  {service.description}
                </p>
                <a
                  href={mailtoUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all"
                >
                  <MailIcon className="h-3.5 w-3.5" />
                  Solicitar por correo
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}