// ===================================================================
//  LAS 12 PUBLICACIONES DEL FEED · Pureza Natural
//  Aquí se cambia todo el texto. La animación se acomoda sola.
//  *asteriscos* = palabras resaltadas.
//  Regla de marca: "purificador", nunca "filtro".
// ===================================================================

window.CONFIG = {
  cuenta: '@purezanatural',
  distribuidor: 'Distribuidor autorizado de Agualogic',   // sale en el pie de todas
  whatsapp: '313 269 6087',
  duracion: 8,        // segundos de cada bucle
};

// Orden de publicación: 1 es la primera que subes, 12 la última.
// En el perfil la 12 queda arriba a la izquierda.
window.PUBLICACIONES = [
  {
    n: 1, fecha: 'Lun 5 oct', pilar: 'Conexión', plantilla: 'particulas', fondo: 'agua', portada: 4.5,
    kicker: 'Hola, somos Pureza Natural',
    titulo: 'Agua pura, *hecha de barro.*',
    texto: 'Purificadores AguaLogic en Villavicencio. Sin luz, sin instalación, sin botellones.',
    alt: 'Puntos de colores que se juntan y forman una gota de agua, con el texto: Agua pura, hecha de barro.',
    caption: `Hola, somos Pureza Natural 💧

Estamos en Villavicencio y llevamos a tu casa el purificador AguaLogic: vidrio, barro y acero. No usa luz y no hay que instalar nada.

Por aquí vas a ver cómo funciona, cuánto se te va en botellones y lo que nos cuentan quienes ya lo tienen.

¿Tienes una pregunta? Escríbenos por DM. Te contestamos nosotros.`,
    hashtags: '#Villavicencio #AguaPura #PurificadorDeAgua #Meta #HogarConsciente',
  },
  {
    n: 2, fecha: 'Mié 7 oct', pilar: 'Educación', plantilla: 'rutas', fondo: 'niebla', portada: 3.2,
    kicker: 'Cómo purifica',
    titulo: 'Tres capas. *Cero electricidad.*',
    pasos: [
      ['Llenas arriba', 'Con agua de la llave, sin conectar nada.'],
      ['Arcilla', 'Poros de 0,2 micras que frenan sedimentos y bacterias.'],
      ['Carbón activado', 'Le quita el cloro, el olor y el sabor raro.'],
      ['Plata coloidal', 'Actúa sobre coliformes y E. coli.'],
      ['Agua lista', 'Cae gota a gota al vidrio. Sirves abajo.'],
    ],
    pie: 'Guárdalo',
    alt: 'Esquema de gotas de agua bajando por las tres capas de la vasija de barro: arcilla, carbón activado y plata coloidal.',
    caption: `Llenas arriba y la gravedad hace el resto.

El agua pasa gota a gota por la vasija de barro. Ahí trabajan tres capas:
01 Arcilla, con poros de 0,2 a 0,5 micras que frenan sedimentos, bacterias y parásitos.
02 Carbón activado, que le quita el cloro, el olor y ese sabor raro.
03 Plata coloidal, que actúa sobre coliformes y E. coli.

Sin enchufe, sin tubería y sin técnico. Guárdalo para cuando te pregunten cómo funciona.`,
    hashtags: '#AguaPura #PurificadorDeAgua #Villavicencio #AguaSegura #VidaSana',
  },
  {
    n: 3, fecha: 'Vie 9 oct', pilar: 'Educación', plantilla: 'frase', fondo: 'verde', portada: 4.5,
    kicker: 'Lo que nadie te cuenta',
    titulo: 'Hervir no saca lo que llega por *la tubería.*',
    texto: 'Hervir ayuda con los gérmenes. Pero la turbiedad y metales como el arsénico se quedan en el agua.',
    pie: 'Compártelo',
    alt: 'Una frase se reorganiza en un titular grande: Hervir no saca lo que llega por la tubería.',
    caption: `Hervir ayuda con los gérmenes, eso sí. Pero la turbiedad y metales como el arsénico no se van con el hervor.

Y está la espera: hervir, dejar enfriar, pasar a la jarra, repetir.

Con el purificador llenas la vasija y en unas horas tienes agua lista. Compártelo con quien todavía hierve el agua todos los días.`,
    hashtags: '#AguaPura #Villavicencio #PurificadorDeAgua #AguaSegura #Meta',
  },
  {
    n: 4, fecha: 'Lun 12 oct', pilar: 'Inspiración', plantilla: 'pestanas', fondo: 'niebla', portada: 6.3,
    kicker: 'Pequeños rituales',
    titulo: 'Tu día, *con agua a la mano.*',
    pestanas: [
      { nombre: 'Mañana', filas: [['Al despertar', 'Un vaso antes del tinto'], ['En la cocina', 'Agua lista para el desayuno'], ['Para salir', 'Llenas tu botella de vidrio']] },
      { nombre: 'Tarde', filas: [['Almuerzo', 'Una jarra en la mesa'], ['Con el calor del llano', 'Siempre hay agua lista'], ['Las plantas', 'También toman de la buena']] },
      { nombre: 'Noche', filas: [['La cena', 'Agua limpia para cocinar'], ['Antes de dormir', 'Un vaso en la mesa de noche'], ['Mientras duermes', 'Llenas la vasija y amanece lista']] },
    ],
    alt: 'Tres pestañas, mañana, tarde y noche, con pequeños momentos del día para tomar agua en casa.',
    caption: `Tomar más agua no tiene que ser un propósito de año nuevo. Es tenerla a la mano.

Un vaso al despertar, una jarra en el almuerzo, otro en la mesa de noche. Y antes de dormir llenas la vasija para que amanezca lista.

¿Cuál de estos ya haces? Guárdalo y prueba uno esta semana.`,
    hashtags: '#Bienestar #HábitosSaludables #AguaPura #Villavicencio #HogarConsciente',
  },
  {
    n: 5, fecha: 'Mié 14 oct', pilar: 'Conexión', plantilla: 'lupa', fondo: 'verde', portada: 4.7,
    kicker: 'Lo que vivimos en casa',
    titulo: '¿Cuál *te toca* a ti?',
    lista: [
      'Hervir el agua y esperar a que enfríe',
      'Subir un botellón de 20 kilos',
      'El sabor a cloro del agua de la llave',
      'Quedarse sin agua justo el domingo',
      'Dudar si el agua sí está limpia',
    ],
    pie: 'Cuéntanos en los comentarios',
    alt: 'Una lupa recorre una lista de problemas con el agua en casa, como subir un botellón de 20 kilos o quedarse sin agua el domingo.',
    caption: `Hervir, esperar, cargar, repetir. Esto pasa en muchas casas.

¿Cuál te toca a ti? Escríbelo en comentarios, te leemos.`,
    hashtags: '#Villavicencio #AguaPura #VidaEnCasa #PurificadorDeAgua #Meta',
  },
  {
    n: 6, fecha: 'Vie 16 oct', pilar: 'Inspiración', plantilla: 'mascara', fondo: 'sol', portada: 4.5,
    kicker: 'Otra vida para tu vasija',
    palabra: 'MATERA',
    titulo: 'A los 2 años, tu vasija de barro *se vuelve matera.*',
    texto: 'Cuando la cambias, la vieja se queda en tu casa con una planta. No se bota nada.',
    alt: 'La palabra MATERA se llena con hojas y una vasija de barro. Texto: A los 2 años, tu vasija de barro se vuelve matera.',
    caption: `La vasija de barro se cambia cada 2 años.

Y la vieja no se bota: queda perfecta como matera para una planta 🌿

Compártelo con alguien que ama las plantas.`,
    hashtags: '#HogarConsciente #Villavicencio #Plantas #CeroDesperdicio #AguaPura',
  },
  {
    n: 7, fecha: 'Lun 19 oct', pilar: 'Transparencia', plantilla: 'zoom', fondo: 'verde', portada: 4.6,
    kicker: 'Evidencia, no promesas',
    titulo: 'Lo midió el laboratorio, *no nosotros.*',
    datos: [['Turbiedad', '−95,2 %'], ['Coliformes y E. coli', '100 %'], ['Arsénico', '−84,8 %']],
    dato: { etiqueta: 'Coliformes y E. coli removidos', valor: 100, sufijo: ' %', nota: 'En las muestras analizadas' },
    fuente: 'Laboratorio de Ingeniería Ambiental, Universidad Nacional. Frente a la Resolución 2115 de 2007.',
    texto: 'Resultados de las muestras de cada informe. No garantizan lo mismo en cualquier fuente de agua.',
    pie: 'Pídenos los informes por DM',
    alt: 'Panel de resultados de laboratorio. Se amplía el dato: 100 % de coliformes y E. coli removidos en las muestras analizadas.',
    caption: `No te pedimos que nos creas a nosotros.

Pruebas del Laboratorio de Ingeniería Ambiental de la Universidad Nacional, acreditado por el IDEAM, y de la Universidad del Magdalena, frente a la Resolución 2115 de 2007:
100 % de coliformes y E. coli removidos en las muestras analizadas.
95,2 % menos turbiedad.
84,8 % menos arsénico.

Son resultados de las muestras de cada informe. No garantizan lo mismo en cualquier fuente de agua. Si quieres ver los informes completos, escríbenos por DM y te los mandamos.`,
    hashtags: '#AguaSegura #PurificadorDeAgua #Villavicencio #AguaPura #Meta',
  },
  {
    n: 8, fecha: 'Mié 21 oct', pilar: 'Transparencia', plantilla: 'capas', fondo: 'agua', portada: 4.0,
    kicker: 'Así está hecho',
    titulo: 'Pieza por pieza, *sin secretos.*',
    piezas: [
      ['tapa', 'Tapa', 'Acero inoxidable. No entra polvo ni insectos.'],
      ['barro', 'Vasija de barro', 'Arcilla con carbón activado y plata coloidal.'],
      ['vidrio', 'Vidrio', 'Guarda el agua ya purificada.'],
      ['llave', 'Llave', 'Acero inoxidable. Sirves directo al vaso.'],
    ],
    foto: 'purificador-planta',
    alt: 'El purificador se separa en sus cuatro piezas: tapa de acero, vasija de barro, recipiente de vidrio y llave.',
    caption: `Así está hecho, pieza por pieza.

Tapa de acero inoxidable. Vasija de barro con carbón activado y plata coloidal. Recipiente de vidrio que no suelta sabores. Llave de acero para servir directo al vaso.

Mide 45 cm de alto y guarda 20 litros. Guárdalo si estás pensando en tener uno.`,
    hashtags: '#PurificadorDeAgua #Villavicencio #HogarConsciente #AguaPura #DiseñoNatural',
  },
  {
    n: 9, fecha: 'Vie 23 oct', pilar: 'Educación', plantilla: 'barras', fondo: 'niebla', portada: 4.5,
    kicker: 'Tu espalda también cuenta',
    titulo: 'Lo que cargas *en un año.*',
    mensual: 120, unidad: 'kg',
    texto: '6 botellones de 20 kilos al mes, escaleras arriba.',
    alt: 'Gráfica de los kilos de botellón que se cargan en un año: llega a 1.440 kilos.',
    caption: `6 botellones de 20 kilos al mes son 120 kilos. En un año, 1.440 kilos cargados, muchas veces por la escalera.

Eso también es parte de cuidarse. Etiqueta a quien sube los botellones en tu casa.`,
    hashtags: '#Bienestar #Villavicencio #VidaEnCasa #AguaPura #Meta',
  },
  {
    n: 10, fecha: 'Lun 26 oct', pilar: 'Conexión', plantilla: 'baraja', fondo: 'niebla', portada: 4.5,
    kicker: 'Lo que dicen en casa',
    titulo: 'Mejor que lo *digan ellos.*',
    // Citas textuales de clientes. No cambiar sus palabras.
    testimonios: [
      ['Muy recomendados sus productos.', 'Chio Duque'],
      ['Excelente alternativa para tomar un agua purificada y de calidad.', 'Camilo Valbuena'],
    ],
    cierre: '¿Ya tienes el tuyo? *Cuéntanos cómo te va.*',
    alt: 'Tres tarjetas se abren en abanico con opiniones de clientes de Pureza Natural.',
    caption: `Mejor que te lo cuenten ellos.

Gracias, Chio y Camilo, por escribirnos. ¿Ya tienes el tuyo? Cuéntanos cómo te ha ido, nos encanta leerlos.`,
    hashtags: '#Villavicencio #ClientesFelices #PurificadorDeAgua #AguaPura #Meta',
  },
  {
    n: 11, fecha: 'Mié 28 oct', pilar: 'Transparencia', plantilla: 'persianas', fondo: 'foto', portada: 4.0,
    foto: 'purificador-spa',
    encuadre: [1, .5],   // mueve la foto: 0 = izquierda, 1 = derecha
    kicker: 'El purificador',
    titulo: 'Vidrio, barro y acero. *Nada más.*',
    texto: 'AguaLogic de 20 litros. Sin luz, sin instalación, sin botellones.',
    boton: 'Pide el tuyo por DM',
    alt: 'Unas persianas verdes se abren y muestran el purificador AguaLogic sobre piedra, entre plantas y cuencos.',
    caption: `Vidrio, barro y acero. Nada más.

Purificador AguaLogic de 20 litros. Lo pones en el mesón, llenas la vasija y listo. Sin luz, sin instalación, sin botellones.

Somos distribuidores autorizados en Villavicencio. Escríbenos por DM y te damos el precio.`,
    hashtags: '#PurificadorDeAgua #Villavicencio #AguaPura #Meta #HogarConsciente',
  },
  {
    n: 12, fecha: 'Vie 30 oct', pilar: 'Conexión', plantilla: 'mascara', fondo: 'verde', portada: 4.5,
    kicker: 'Herencia',
    palabra: 'BARRO', foto: 'barro',
    titulo: 'Nuestras abuelas *ya lo sabían.*',
    texto: 'En la casa de la abuela el agua se guardaba en barro. Hoy el barro también la purifica.',
    alt: 'La palabra BARRO se llena con una foto de barro poroso. Texto: Nuestras abuelas ya lo sabían.',
    caption: `En la casa de la abuela el agua vivía en barro. Fresca, tranquila, sin afán.

Seguimos creyendo en eso. Hoy el barro, junto al carbón activado y la plata coloidal, también purifica el agua de tu casa.

¿Tu abuela tenía tinajero? Cuéntanos en comentarios 🤎`,
    hashtags: '#Herencia #Villavicencio #Barro #HogarConsciente #AguaPura',
  },
];
