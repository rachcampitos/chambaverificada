import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de Privacidad — chambaverificada",
};

export default function PoliticaPrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad" updated="4 de septiembre de 2026">
      <p>
        Esta política explica qué datos procesa <strong>chambaverificada</strong> cuando usas el
        verificador de ofertas, en cumplimiento de la Ley N° 29733, Ley de Protección de Datos
        Personales del Perú, y su reglamento.
      </p>

      <section>
        <h2>1. Quién trata los datos</h2>
        <p>
          chambaverificada es un servicio operado por <strong>Code Media E.I.R.L.</strong> (RUC
          20615496074), domiciliada en Perú.
        </p>
      </section>

      <section>
        <h2>2. Qué datos procesamos</h2>
        <p>
          Para usar chambaverificada <strong>no necesitas crear una cuenta</strong> ni entregarnos tu
          nombre, correo o teléfono. El único dato que procesamos es el <strong>texto que pegás</strong>{" "}
          en el formulario (el contenido de la oferta de trabajo que querés verificar) y, si preguntás
          algo en el chat de seguimiento, el contenido de esas preguntas.
        </p>
        <p>
          Si el texto que pegás incluye datos personales tuyos o de terceros (por ejemplo, si copiás
          una conversación de WhatsApp completa), esos datos se procesan únicamente para el análisis y
          nunca se usan con otro fin.
        </p>
      </section>

      <section>
        <h2>3. Cómo se procesa (transferencia internacional)</h2>
        <p>
          El texto que pegás se envía a la API de <strong>Anthropic</strong> (Anthropic PBC, con sede
          en Estados Unidos) para generar el análisis de riesgo mediante inteligencia artificial. Esto
          constituye una transferencia internacional de datos hacia un tercero que actúa como encargado
          del tratamiento, exclusivamente para prestar este servicio.
        </p>
        <p>
          Si el texto menciona un RUC, lo consultamos contra el padrón público de contribuyentes que
          publica SUNAT como dato abierto — esta consulta no involucra ningún dato personal tuyo, solo
          el número de RUC mencionado en la oferta.
        </p>
      </section>

      <section>
        <h2>4. Cuánto tiempo se conservan los datos</h2>
        <p>
          <strong>No almacenamos</strong> el texto de las ofertas ni las preguntas del chat en ninguna
          base de datos. Se procesan en el momento de la solicitud y se descartan inmediatamente después
          de devolverte el resultado. No guardamos historial de tus verificaciones.
        </p>
      </section>

      <section>
        <h2>5. Cookies y rastreo</h2>
        <p>
          chambaverificada <strong>no usa cookies ni herramientas de analítica o rastreo</strong>. No
          hay perfiles de usuario ni publicidad dirigida.
        </p>
      </section>

      <section>
        <h2>6. Tus derechos (ARCO)</h2>
        <p>
          Como titular de datos personales, tenés derecho a acceder, rectificar, cancelar y oponerte al
          tratamiento de tus datos, conforme a la Ley N° 29733. Como no almacenamos datos identificables
          asociados a vos, en la práctica no existe un registro que rectificar o cancelar — pero si
          tenés cualquier consulta, podés escribirnos a los datos de contacto abajo.
        </p>
      </section>

      <section>
        <h2>7. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política si cambia cómo procesamos datos. La fecha de
          &ldquo;última actualización&rdquo; arriba refleja la versión vigente.
        </p>
      </section>

      <section>
        <h2>8. Contacto</h2>
        <p>
          Code Media E.I.R.L. — RUC 20615496074
          <br />
          [correo de contacto pendiente de definir]
        </p>
      </section>
    </LegalPage>
  );
}
