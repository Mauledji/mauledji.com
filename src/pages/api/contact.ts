export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  let body: { name: string; email: string; message: string };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const { name, email, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
  }

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400 });
  }

  try {
    await resend.emails.send({
      // Sin dominio verificado: usa onboarding@resend.dev (funciona en free tier)
      // Con dominio verificado: cambia a algo como contact@tudominio.com
      from: 'Portfolio Contact <contact@mauledji.com>',
      to: 'mauledji@outlook.com',
      replyTo: email,
      subject: `[Portfolio] Mensaje de ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed; margin-bottom: 4px;">Nuevo mensaje desde el portfolio</h2>
          <hr style="border: 1px solid #e2e8f0; margin-bottom: 20px;" />

          <p style="margin: 0 0 6px;"><strong>Nombre:</strong> ${name}</p>
          <p style="margin: 0 0 20px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>

          <div style="background: #f8fafc; border-left: 3px solid #7c3aed; padding: 16px; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
            Enviado desde mauricioljdev.com
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
  }
};
