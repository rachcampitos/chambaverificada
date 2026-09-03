import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Términos y Condiciones — chambaverificada",
};

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y Condiciones" updated="4 de septiembre de 2026">
      <p>
        Al usar chambaverificada aceptás estos términos. Si no estás de acuerdo, por favor no uses el
        servicio.
      </p>

      <section>
        <h2>1. Qué es chambaverificada</h2>
        <p>
          chambaverificada es una herramienta gratuita que analiza el texto de ofertas de trabajo
          para identificar señales de posible fraude laboral, usando inteligencia artificial y datos
          públicos (padrón de RUC de SUNAT). El servicio es operado por{" "}
          <strong>Code Media E.I.R.L.</strong> (RUC 20615496074).
        </p>
      </section>

      <section>
        <h2>2. chambaverificada no es una garantía</h2>
        <p>
          El resultado (riesgo bajo, medio o alto) es una <strong>estimación generada por un modelo
          de inteligencia artificial</strong>, no una certificación ni una garantía de que una oferta
          sea legítima o fraudulenta. La IA puede cometer errores, tanto marcando como riesgosa una
          oferta legítima como al revés.
        </p>
        <p>
          <strong>chambaverificada no reemplaza tu propio criterio.</strong> Antes de compartir datos
          personales o bancarios con cualquier empleador, verificá por tu cuenta la información que te
          parezca relevante.
        </p>
      </section>

      <section>
        <h2>3. No es asesoría legal ni laboral</h2>
        <p>
          El contenido generado por chambaverificada (incluido el chat de seguimiento) tiene fines
          informativos y no constituye asesoría legal, laboral ni profesional de ningún tipo.
        </p>
      </section>

      <section>
        <h2>4. Verificación de empresas</h2>
        <p>
          Cuando el texto incluye un RUC, lo contrastamos contra el padrón público de SUNAT
          (actualizado a diario). Que una empresa figure como &ldquo;ACTIVO&rdquo; y &ldquo;HABIDO&rdquo; confirma su
          registro formal ante SUNAT en la fecha de la consulta — no implica que chambaverificada
          garantice la legitimidad de la oferta específica que esa empresa publicó.
        </p>
      </section>

      <section>
        <h2>5. Uso permitido</h2>
        <ul>
          <li>Usar el servicio para verificar ofertas de trabajo reales, propias o de terceros.</li>
          <li>No usar el servicio para intentar manipular, sobrecargar o interferir con su funcionamiento.</li>
          <li>No usar el servicio con fines ilegales o para difamar a personas o empresas.</li>
        </ul>
        <p>
          Nos reservamos el derecho de limitar el acceso a quienes usen el servicio de forma abusiva.
        </p>
      </section>

      <section>
        <h2>6. Limitación de responsabilidad</h2>
        <p>
          chambaverificada se ofrece &ldquo;tal cual&rdquo;, sin garantías de disponibilidad continua, exactitud
          o ausencia de errores. En la máxima medida permitida por la ley peruana, Code Media E.I.R.L.
          no será responsable por decisiones que tomes basándote en los resultados del servicio, ni por
          daños derivados del uso o la imposibilidad de uso de chambaverificada.
        </p>
      </section>

      <section>
        <h2>7. Cambios al servicio</h2>
        <p>
          Podemos modificar, suspender o discontinuar chambaverificada, total o parcialmente, en
          cualquier momento.
        </p>
      </section>

      <section>
        <h2>8. Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes de la República del Perú.</p>
      </section>

      <section>
        <h2>9. Contacto</h2>
        <p>
          Code Media E.I.R.L. — RUC 20615496074
          <br />
          [correo de contacto pendiente de definir]
        </p>
      </section>
    </LegalPage>
  );
}
