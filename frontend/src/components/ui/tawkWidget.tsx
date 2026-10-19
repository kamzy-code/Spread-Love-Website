import Script from "next/script";

// Customer-support live chat. Public layout only — never mount in the admin
// layout. Renders nothing unless both IDs are set, so the code can ship
// before (or without) a Tawk.to account. The IDs are build-time public
// values (they appear in the embed URL), not secrets.
export default function TawkWidget() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

  if (!propertyId || !widgetId) return null;

  return (
    <Script id="tawk-to" strategy="afterInteractive">{`
      var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
      (function () {
        var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = "https://embed.tawk.to/${propertyId}/${widgetId}";
        s1.charset = "UTF-8";
        s1.setAttribute("crossorigin", "*");
        s0.parentNode.insertBefore(s1, s0);
      })();
    `}</Script>
  );
}
