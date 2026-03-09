import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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