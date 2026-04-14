import {prisma} from '../config/prisma';
import nodemailer from 'nodemailer';

const mailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false // Esto ayuda si hay problemas de certificados en Render
    },
    family: 4 // Esto fuerza el uso de IPv4 en Render
};

const transport = nodemailer.createTransport(mailConfig);

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
    try {
        const mailOptions = {
            from: `"SPEC MEET" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        };

        const info = await transport.sendMail(mailOptions);
        console.log(`Correo enviado con éxito a ${to} (ID: ${info.messageId})`);
        return true;
    } catch(error) {
        console.error('Error enviando ', error);
        return false;
    }
};

export const sendConfirmationEmail = async (reservation: any, accessCode: string | null) => {
    const opcionesFecha: Intl.DateTimeFormatOptions = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Mexico_City'};
    const opcionesHora: Intl.DateTimeFormatOptions = {hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City'}

    const fechaReserva = reservation.start_time.toLocaleDateString('es-MX', opcionesFecha);
    const horaInicio = reservation.start_time.toLocaleTimeString('es-MX', opcionesHora);
    const horaFin = reservation.end_time.toLocaleTimeString('es-MX', opcionesHora);

    const emailHtml = `
        
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #27272a;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #000000; margin-bottom: 5px;">¡Bienvenido a tu sala .MEET! 🎉</h2>
                    </div>
                    
                    <p style="font-size: 16px;">Hola <strong>${reservation.user.name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.5;">Tu reservación ha sido confirmada exitosamente. Nos da mucho gusto recibirte.</p>
                    <p style="font-size: 16px; line-height: 1.5;">A continuación, te compartimos todos los detalles que necesitas para tu sesión:</p>
                    
                    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e4e4e7;">
                        <p style="margin: 5px 0; font-size: 15px;"><strong>📅 Fecha:</strong> <span style="text-transform: capitalize;">${fechaReserva}</span></p>
                        <p style="margin: 5px 0; font-size: 15px;"><strong>⏰ Horario:</strong> ${horaInicio} a ${horaFin}</p>
                    </div>

                    <h3 style="color: #000000; margin-top: 30px; border-bottom: 2px solid #f4f4f5; padding-bottom: 5px;">🔑 Tu Acceso Autónomo</h3>
                    
                    ${accessCode 
                        ? `<div style="text-align: center; margin: 20px 0; padding: 20px; background-color: #000000; border-radius: 8px;">
                             <p style="margin: 0; color: #a1a1aa; font-size: 14px;">Código de puerta:</p>
                             <p style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 5px; margin: 10px 0;">${accessCode}</p>
                             <p style="font-size: 12px; color: #a1a1aa; line-height: 1.4; margin-top: 10px;">(Digita este código en la cerradura electrónica para abrir. Tu código se activará 10 minutos antes de tu horario de inicio y caducará al finalizar tu tiempo).</p>
                           </div>` 
                        : `<div style="text-align: center; margin: 20px 0; padding: 20px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #d97706;">
                             <p style="margin: 0;"><strong>⚠️ Tu código de acceso está en proceso.</strong></p>
                             <p style="font-size: 14px; margin-top: 10px;">Tuvimos un ligero retraso generando tu PIN automático. Te lo enviaremos a la brevedad. ¡Tu reserva está 100% confirmada!</p>
                           </div>`
                    }

                    <h3 style="color: #000000; margin-top: 30px; border-bottom: 2px solid #f4f4f5; padding-bottom: 5px;">📍 Ubicación</h3>
                    <p style="margin: 5px 0; font-size: 15px;"><strong>Lugar:</strong> Plaza Distrito Marqués, Local 209</p>
                    <p style="margin: 5px 0; font-size: 15px;"><strong>Dirección:</strong> Av. Paseo de la Reforma 231, Int 209. Lomas del Marqués. Querétaro Qro. 76146</p>
                    <p style="margin: 10px 0 5px 0; font-size: 15px;"><strong>🗺️ Google Maps:</strong> <a href="https://maps.app.goo.gl/Q35LHn7vStRbMfkH7" style="color: #2563eb; text-decoration: none;">Abrir en el mapa</a></p>

                    <h3 style="color: #000000; margin-top: 30px; border-bottom: 2px solid #f4f4f5; padding-bottom: 5px;">💡 Información Útil</h3>
                    <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 5px 0; font-size: 15px;"><strong>📶 Red WiFi:</strong> ${reservation.room.wifi_ssid}</p>
                        <p style="margin: 5px 0; font-size: 15px;"><strong>🔐 Contraseña:</strong> ${reservation.room.wifi_pass}</p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.5; margin-top: 20px;">Al ser un espacio 100% autónomo, te pedimos amablemente que al finalizar tu sesión nos ayudes <strong>apagando las luces y el aire acondicionado</strong>, y verificando que la puerta quede bien cerrada al salir.</p>
                    
                    <p style="font-size: 15px; line-height: 1.5;">Si necesitas asistencia durante tu visita, puedes responder a este correo o escribirnos directamente a nuestro WhatsApp: <a href="https://wa.me/521234567890" style="color: #2563eb; text-decoration: none;">[PON_TU_NUMERO_AQUI]</a>.</p>
                    
                    <p style="font-size: 16px; font-weight: bold; margin-top: 30px; text-align: center;">¡Que tengas una excelente y productiva sesión!</p>
                    <p style="font-size: 14px; color: #71717a; text-align: center;">Atentamente,<br>El equipo de .MEET</p>
                </div>
            
    `;
    return sendEmail(reservation.user.email, '!Reserva Confirmada¡ - SPEC MEET', emailHtml)
};

export const notifyAdminsNewReservation = async (reservationId: string) => {
    try {
        const reservation = await prisma.reservation.findUnique({
            where: {id: reservationId},
            include: {
                user: {select: {name: true, email: true}},
                room: {select: {name: true}}
            }
        });

        if(!reservation) return;

        const admins = await prisma.user.findMany({
            where: {role: 'ADMIN'},
            select: {email: true}
        });

        const adminEmails = admins.map(admin => admin.email);
        if(adminEmails.length === 0) return;

        const dateStr = reservation.start_time.toLocaleDateString('es-MX');
        const startStr = reservation.start_time.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'});
        const endStr = reservation.end_time.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'});
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmails,
            subject: `🚨 Nueva Reserva Confirmada: ${reservation.room.name}`,
            html: `
                <h1>Nueva Reserva en SPEC.MEET</h1>
                <p>Se ha confirmado un nuevo pago para la sala <strong>${reservation.room.name}</strong>.</p>
                <hr />
                <ul>
                    <li><strong>Cliente:</strong> ${reservation.user.name} (${reservation.user.email})</li>
                    <li><strong>Fecha:</strong> ${dateStr}</li>
                    <li><strong>Horario:</strong> ${startStr} - ${endStr}</li>
                    <li><strong>Monto:</strong> $${reservation.total_paid} MXN</li>
                </ul>
                <p>Revisa el dashboard administrativo para más detalles.</p>
            `
        };

        await transport.sendMail(mailOptions);
        console.log('Notificacion enviada a los administradores.');
    } catch(error){
        console.error('Error al notificar a los admin: ', error);
    }
};

export const sendGiftCardEmail = async (email: string, userName: string, code: string, hours: number, expiresAt: Date, description: string) => {
    const expirationStr = expiresAt.toLocaleDateString('es-MX', { 
        day: 'numeric', month: 'long', year: 'numeric' 
    });

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #27272a;">
            <h2 style="color: #000; text-align: center;">¡Tienes un regalo de SPEC.MEET! 🎁</h2>
            <p style="font-size: 16px;">Hola <strong>${userName}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.5;">Administración te ha asignado un beneficio especial para tus próximas sesiones:</p>
            
            <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px dashed #a1a1aa;">
                <p style="margin: 0; color: #71717a; font-size: 14px;">Tu código de cortesía por <strong>${hours} horas</strong> es:</p>
                <h1 style="font-size: 32px; letter-spacing: 3px; color: #000; margin: 10px 0;">${code}</h1>
                <p style="font-size: 12px; color: #71717a;">Válido hasta el: ${expirationStr}</p>
            </div>

            <p style="font-size: 14px; color: #71717a;"><strong>Motivo:</strong> ${description || 'Cortesía especial de la casa'}</p>
            <p style="font-size: 15px; margin-top: 20px;">Puedes aplicar este código directamente en el checkout al momento de agendar tu siguiente espacio.</p>
            
            <p style="font-size: 14px; color: #a1a1aa; text-align: center; margin-top: 30px;">Atentamente,<br>El equipo de .MEET</p>
        </div>
    `;

    return sendEmail(email, '🎁 ¡Te han regalado horas en SPEC.MEET!', emailHtml);
};