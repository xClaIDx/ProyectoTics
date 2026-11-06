export function HowItWorks() {
  return (
    <main className="contenedor pagina estrecha-pagina">
      <h1>Cómo se calcula el CASA SCORE</h1>
      <div className="caja">
        <p>Cada cuarto recibe un puntaje de 0 a 100. Primero, cada criterio se lleva a la misma escala de 0 a 100:</p>
        <ul>
          <li><b>Precio:</b> 100 si cuesta S/ 140 o menos y 0 si cuesta S/ 850 o más.</li>
          <li><b>Cercanía:</b> mitad distancia (de 50 a 3,000 m) y mitad tiempo a pie (de 2 a 40 min) a tu punto de referencia.</li>
          <li><b>Seguridad:</b> 1 punto base más 1 por cada característica con foto: portón con llave, rejas, iluminación exterior y cámara.</li>
          <li><b>Servicios 24 h:</b> agua 40, luz 30 e internet 30.</li>
          <li><b>Baño:</b> privado 100 y compartido 0.</li>
        </ul>
        <p>Luego se calcula el promedio ponderado con tus prioridades (de 0 a 5), se suman las bonificaciones (luz natural +8, entrada libre +5, 16 m² o más +4) y se restan las penalizaciones (hora de llegada −20, −12 o −6; sin visitas −12; sin cocina −8; condiciones no declaradas −25). El resultado se limita entre 0 y 100.</p>
        <p>Ningún pago cambia la posición de un cuarto: el orden depende solo del puntaje.</p>
      </div>
    </main>
  );
}
