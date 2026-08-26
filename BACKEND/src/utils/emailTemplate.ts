// Shared HTML shell for every outbound email — one place owns the brand
// look (logo, colors, footer) so individual send methods in emailService.ts
// only ever write their own body content, not markup boilerplate.
//
// Table-based layout with inline styles throughout: email clients (Outlook
// desktop especially) don't reliably support <style> blocks, flexbox/grid,
// or external stylesheets, so nothing here relies on any of that. The
// gradient header sets a plain background-color first as a fallback for
// clients that ignore background-image, then layers the real brand
// gradient on top for everything that supports it.

const BRAND_START = "#9d0057";
const BRAND_END = "#ff017e";
const BRAND_SOFT = "#fdf2f8";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#4b5563";
const TEXT_FOOTER = "#9ca3af";
const BORDER = "#e5e7eb";

// System font stack, not the site's actual fonts (Inter / Dancing Script) —
// custom @font-face and Google Fonts links are stripped or ignored by most
// email clients, so this is the closest safe approximation of the site's
// look rather than a guaranteed match.
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const LOGO_URL = "https://spreadlovenetwork.com/logo.png";

export function renderEmailButton(label: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 28px auto 8px;">
      <tr>
        <td align="center" bgcolor="${BRAND_START}" style="border-radius: 999px; background-color: ${BRAND_START}; background-image: linear-gradient(135deg, ${BRAND_START} 0%, ${BRAND_END} 100%);">
          <a href="${href}" target="_blank" style="display: inline-block; padding: 14px 36px; font-family: ${FONT_STACK}; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 999px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

// Amber warning callout — visually distinct from renderInfoBox's neutral
// pink, for things the reader needs to actually act on (e.g. "this expires,
// download it"), not just reference facts.
export function renderNoticeBox(text: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; margin: 20px 0;">
      <tr>
        <td style="padding: 14px 18px; font-family: ${FONT_STACK}; font-size: 14px; color: #92400e; line-height: 1.6;">
          ${text}
        </td>
      </tr>
    </table>`;
}

// A soft-pink highlighted block for the handful of facts a reader must not
// miss (booking ID, a link) — label/value pairs, bold values for legibility.
export function renderInfoBox(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding: 5px 0; font-family: ${FONT_STACK}; font-size: 14px; color: ${TEXT_MUTED}; white-space: nowrap; vertical-align: top;">${r.label}</td>
        <td style="padding: 5px 0 5px 16px; font-family: ${FONT_STACK}; font-size: 14px; color: ${TEXT_DARK}; font-weight: 700;">${r.value}</td>
      </tr>`,
    )
    .join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${BRAND_SOFT}; border-radius: 12px; margin: 20px 0;">
      <tr>
        <td style="padding: 16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`;
}

// One card per recipient — name/phone as the bold headline, everything
// else as quiet metadata, matching the "important info stays legible"
// brief better than a plain bullet list would.
export function renderRecipientCard(recipient: {
  name: string;
  phone: string;
  country: string;
  callDate: string;
}): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid ${BORDER}; border-radius: 10px; margin: 0 0 12px;">
      <tr>
        <td style="padding: 14px 18px;">
          <p style="margin: 0 0 4px; font-family: ${FONT_STACK}; font-size: 15px; font-weight: 700; color: ${TEXT_DARK};">
            ${recipient.name}
          </p>
          <p style="margin: 0; font-family: ${FONT_STACK}; font-size: 13px; color: ${TEXT_MUTED}; line-height: 1.6;">
            ${recipient.phone} · ${recipient.country}<br/>
            Call date: ${recipient.callDate}
          </p>
        </td>
      </tr>
    </table>`;
}

export function renderEmailLayout(options: {
  title: string;
  preheader: string;
  bodyHtml: string;
}): string {
  const { title, preheader, bodyHtml } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <!-- Preheader: hidden, but most inboxes show this instead of the first line of body text -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">
    ${preheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
          <tr>
            <td align="center" bgcolor="${BRAND_START}" style="background-color: ${BRAND_START}; background-image: linear-gradient(135deg, ${BRAND_START} 0%, ${BRAND_END} 100%); padding: 32px 24px;">
              <img src="${LOGO_URL}" width="44" height="44" alt="Spread Love Network" style="display: block; margin: 0 auto 10px; border-radius: 10px;" />
              <span style="font-family: ${FONT_STACK}; font-size: 20px; font-weight: 700; color: #ffffff;">Spread Love Network</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid ${BORDER};">
              <p style="margin: 0 0 8px; font-family: ${FONT_STACK}; font-size: 13px; color: ${TEXT_FOOTER}; line-height: 1.6;">
                Making special moments even more memorable with personalized surprise calls.
              </p>
              <p style="margin: 0; font-family: ${FONT_STACK}; font-size: 13px; color: ${TEXT_FOOTER};">
                Imo, Nigeria &nbsp;·&nbsp;
                <a href="mailto:spreadlovenetwork@gmail.com" style="color: ${TEXT_FOOTER};">spreadlovenetwork@gmail.com</a>
              </p>
              <p style="margin: 12px 0 0; font-family: ${FONT_STACK}; font-size: 12px; color: #c1c5cb;">
                &copy; ${new Date().getFullYear()} Spread Love Network. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const emailTextStyles = {
  fontStack: FONT_STACK,
  heading: `margin: 0 0 6px; font-family: ${FONT_STACK}; font-size: 22px; font-weight: 700; color: ${TEXT_DARK};`,
  body: `margin: 0 0 8px; font-family: ${FONT_STACK}; font-size: 15px; color: ${TEXT_MUTED}; line-height: 1.65;`,
  sectionHeading: `margin: 24px 0 12px; font-family: ${FONT_STACK}; font-size: 16px; font-weight: 700; color: ${TEXT_DARK};`,
};
