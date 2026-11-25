import { ReactNode } from 'react';

import { IllustrationKind } from './Illustration';

export interface TourStep {
    /** Valor de data-tour del elemento a resaltar (o un selector CSS que empiece con #). */
    target?: string;
    title: string;
    body: ReactNode;
    illustration?: IllustrationKind;
}

export type TourId = 'interface' | 'first-job';

export interface Tour {
    title: string;
    steps: TourStep[];
}

export const TOURS: Record<TourId, Tour> = {
    interface: {
        title: 'Conocer la pantalla',
        steps: [
            {
                target: 'connect',
                title: 'Conectar al CNC',
                body: 'Con la máquina enchufada por USB y encendida, tocá acá. Si hay una sola placa conectada se conecta sola; si no, elegí el puerto de la lista.',
            },
            {
                target: 'quick-settings',
                title: 'Accesos rápidos',
                body: (
                    <ul className="list-disc ml-5">
                        <li>Tutorial: estas guías.</li>
                        <li>
                            Simple / Avanzado: muestra u oculta las opciones
                            avanzadas.
                        </li>
                        <li>Luna / sol: tema oscuro o claro.</li>
                        <li>ES / EN: idioma.</li>
                    </ul>
                ),
            },
            {
                target: 'model',
                title: 'Tu máquina',
                body: 'Muestra el modelo elegido. Tocalo para cambiarlo.',
            },
            {
                target: '#visualizer_container',
                title: 'Visualizador',
                body: 'Dibuja el recorrido del archivo cargado y la posición de la fresa. Con el botón Simular podés ver el trabajo antes de cortar, sin mover la máquina.',
            },
            {
                target: 'load-file',
                title: 'Cargar archivo',
                body: 'Abrí el G-code que exportaste de Aspire (.nc o .gcode). La flecha muestra los archivos recientes.',
            },
            {
                target: 'job-start',
                title: 'Iniciar',
                body: 'Arranca el trabajo. Se habilita con la máquina conectada y un archivo cargado.',
            },
            {
                target: 'job-pause',
                title: 'Pausa',
                body: 'Frena el trabajo sin perderlo. Para seguir, tocá Iniciar.',
            },
            {
                target: 'job-stop',
                title: 'Detener',
                body: 'Cancela el trabajo. Ante una emergencia, usá además el botón rojo de la máquina.',
            },
            {
                target: 'spindle',
                title: 'Fresadora',
                body: 'Enciende y apaga la fresadora. Durante un trabajo la maneja el archivo.',
            },
            {
                target: 'overrides',
                title: 'Avance',
                body: 'Cambia la velocidad mientras corta (100% es la del archivo). Bajala si la máquina va forzada.',
            },
            {
                target: 'dro',
                title: 'Posición de la fresa',
                body: 'Muestra dónde está la fresa en X, Y y Z. Los botones X0, Y0 y Z0 ponen en cero ese eje; los de la derecha llevan la fresa a cero.',
            },
            {
                target: 'zero-all',
                title: 'Cero en todos los ejes',
                body: 'Toma la posición actual como origen del trabajo: X0 Y0 Z0.',
            },
            {
                target: 'jog',
                title: 'Mover la máquina',
                body: 'Las flechas mueven X e Y; los botones de la derecha suben y bajan Z. Preciso, Normal y Rápido cambian cuánto se mueve en cada toque.',
            },
            {
                target: 'nav',
                title: 'Menú',
                body: 'Tallar es esta pantalla. Drivers: si la PC no reconoce la máquina. Config: los valores internos de la máquina.',
            },
            {
                title: '¡Listo!',
                body: 'Para ver cómo hacer un trabajo paso a paso, abrí Tutorial → Hacer mi primer trabajo.',
            },
        ],
    },
    'first-job': {
        title: 'Hacer mi primer trabajo',
        steps: [
            {
                target: 'load-file',
                title: '1. Cargá el archivo',
                body: 'Tocá Cargar archivo y elegí el G-code que exportaste de Aspire, o uno de la lista de recientes (la flecha).',
            },
            {
                target: '#visualizer_container',
                title: '2. Revisalo',
                body: 'Fijate que el dibujo sea el que querés. Con Simular lo ves recorrer el trabajo sin mover la máquina.',
            },
            {
                title: '3. Fijá la madera',
                illustration: 'board',
                body: 'Apoyala sobre la mesa y sujetala firme con prensas o tornillos, lejos de donde va a pasar la fresa.',
            },
            {
                target: 'jog',
                title: '4. Llevá la fresa al origen (X e Y)',
                illustration: 'xy',
                body: 'Con las flechas, llevá la fresa al punto que usaste como origen en Aspire: casi siempre la esquina delantera izquierda de la madera. Arrancá en Rápido y terminá en Preciso.',
            },
            {
                target: 'jog',
                title: '5. Bajá la fresa hasta la madera (Z)',
                illustration: 'z',
                body: 'Con Z- bajá de a poco hasta que la punta apenas toque la superficie. Truco: poné un papel debajo y bajá hasta que quede apenas apretado.',
            },
            {
                target: 'zero-all',
                title: '6. Poné el cero',
                illustration: 'zero',
                body: 'Tocá Cero: la posición actual pasa a ser X0 Y0 Z0. Para un solo eje, usá X0, Y0 o Z0 en la lista de posiciones.',
            },
            {
                target: 'spindle',
                title: '7. Encendé la fresadora',
                illustration: 'spindle',
                body: 'Si tu archivo ya la enciende, no hace falta. Si no, encendela acá. Usá protección para los ojos y la aspiradora.',
            },
            {
                target: 'job-start',
                title: '8. Iniciá el trabajo',
                illustration: 'carve',
                body: 'Tocá Iniciar. La máquina hace el recorrido del archivo; podés seguir el avance en el visualizador.',
            },
            {
                target: 'job-controls',
                title: '9. Pausa y Detener',
                body: 'Pausa frena el trabajo; para seguir, tocá Iniciar. Detener lo cancela. Ante una emergencia, el botón rojo de la máquina.',
            },
            {
                title: '10. Al terminar',
                body: 'Apagá la fresadora si quedó encendida, alejá la fresa con las flechas y recién ahí retirá la pieza.',
            },
        ],
    },
};
