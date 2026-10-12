/*! consumo-claro — tus derechos al comprar (España/UE) · DataFlow Elegance · MIT
 *  Ley General para la Defensa de Consumidores (RDL 1/2007, reformada por RDL 7/2021). Orientativo.
 */
(function (g) {
  "use strict";
  var DAY = 86400000;
  function parse(s) { var p = String(s).split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function iso(t) { return new Date(t).toISOString().slice(0, 10); }
  function addMonths(t, m) { var d = new Date(t); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + m, d.getUTCDate()); }
  function addYears(t, y) { return addMonths(t, 12 * y); }

  /** Desistimiento en compras a distancia/online: 14 días naturales desde la recepción.
   *  Si no te informaron del derecho, se amplía 12 meses. */
  function desistimiento(recepcion, informado, hoy) {
    var r = parse(recepcion);
    var fin = r + 14 * DAY;
    if (informado === false) fin = addMonths(r, 12) + 14 * DAY;
    var h = hoy ? parse(hoy) : Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    return { fin: iso(fin), en_plazo: h <= fin, dias_restantes: Math.ceil((fin - h) / DAY), ampliado: informado === false };
  }

  /** Garantía legal: bienes nuevos 3 años (compras desde 01/01/2022; antes 2), segunda mano mín. 1 año, contenido digital 2 años. */
  function garantia(compra, tipo, hoy) {
    var c = parse(compra);
    var anos = tipo === "segunda_mano" ? 1 : tipo === "digital" ? 2 : (c >= Date.UTC(2022, 0, 1) ? 3 : 2);
    var fin = addYears(c, anos);
    var h = hoy ? parse(hoy) : Date.now();
    return { anos: anos, fin: iso(fin), vigente: h <= fin,
      presuncion: tipo === "segunda_mano" ? "Se presume que el defecto ya existía si aparece en el primer año." :
        "Si el defecto aparece en los 2 primeros años, se presume que ya existía (el vendedor debe probar lo contrario)." };
  }

  function carta(tipo, d) {
    d = d || {};
    var cab = "A: " + (d.vendedor || "[vendedor]") + "\nDe: " + (d.nombre || "[nombre]") + " — " + (d.contacto || "[email/teléfono]") + "\nFecha: " + (d.fecha || iso(Date.now()-new Date().getTimezoneOffset()*60000)) + "\n\n";
    if (tipo === "desistimiento") {
      return cab + "Asunto: Ejercicio del derecho de desistimiento\n\nPor la presente le comunico que desisto de mi contrato de venta del siguiente bien/servicio: " +
        (d.producto || "[producto]") + ", pedido nº " + (d.pedido || "[nº pedido]") + ", recibido el " + (d.recepcion || "[fecha]") +
        ".\n\nConforme a los artículos 102 y siguientes del RDL 1/2007, solicito el reembolso de todos los pagos recibidos, incluidos los gastos de entrega estándar, en un plazo máximo de 14 días naturales.\n\nAtentamente,\n" + (d.nombre || "[nombre]");
    }
    return cab + "Asunto: Reclamación por falta de conformidad (garantía legal)\n\nEl " + (d.compra || "[fecha de compra]") + " adquirí " + (d.producto || "[producto]") +
      ", que presenta el siguiente defecto: " + (d.defecto || "[describe el defecto]") +
      ".\n\nConforme a los artículos 114 y siguientes del RDL 1/2007 (garantía legal), solicito la reparación o sustitución del producto sin coste alguno y en un plazo razonable. Si no fuera posible, solicito la rebaja del precio o la resolución del contrato.\n\nEn caso de no recibir respuesta en 30 días, presentaré reclamación ante los servicios de Consumo de mi comunidad autónoma.\n\nAtentamente,\n" + (d.nombre || "[nombre]");
  }

  g.ConsumoClaro = { desistimiento: desistimiento, garantia: garantia, carta: carta };
})(typeof window !== "undefined" ? window : globalThis);
