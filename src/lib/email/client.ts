import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.INVITE_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendTeamInvite({
  toEmail,
  ownerName,
  token,
}: {
  toEmail: string;
  ownerName: string;
  token: string;
}) {
  const link = `${APP_URL}/invite/${token}`;

  await resend.emails.send({
    from: `Scriptr <${FROM}>`,
    to: toEmail,
    subject: `${ownerName} invited you to join their Scriptr team`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#08080f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080f;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#0e0e18;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);width:32px;height:32px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-size:16px;">✦</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Scriptr</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fff;line-height:1.3;">
                You're invited to join a team
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;">
                <strong style="color:rgba(255,255,255,0.8);">${ownerName}</strong> has invited you to join their Scriptr workspace. You'll get full Pro access — outlier detection, script writing, idea generation, and more.
              </p>

              <a href="${link}"
                style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;letter-spacing:0.1px;">
                Accept invitation →
              </a>

              <p style="margin:28px 0 0;font-size:13px;color:rgba(255,255,255,0.25);line-height:1.6;">
                This link expires in 7 days. If you weren't expecting this, you can safely ignore it.<br/>
                Or copy this URL: <span style="color:rgba(255,255,255,0.4);">${link}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
                Scriptr · AI-powered YouTube toolkit
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
