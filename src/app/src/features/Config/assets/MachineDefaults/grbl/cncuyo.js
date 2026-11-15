// Valores de fabrica de las maquinas CNC Cuyo (controladora Arduino Uno + GRBL).
//
// IMPORTANTE: solo se cargan valores confirmados por CNC Cuyo. Al usar
// "Restaurar valores por defecto" el programa envia a la maquina UNICAMENTE las
// claves que figuran aca, asi que lo que falta (pasos/mm, aceleraciones, recorrido
// en Z, etc.) no se toca en la maquina.
// Para completar un modelo: conectar una maquina bien calibrada, exportar sus
// ajustes desde Config y pasarlos a este archivo.

// Modelo 9060: 600 mm utiles en X (porticos) x 900 mm utiles en Y. Avance max. 2000 mm/min.
export const CNCUYO_9060 = {
    $110: '2000.000',
    $111: '2000.000',
    $130: '600.000',
    $131: '900.000',
};

// Modelo 11090: hasta 3000 mm/min (motores NEMA 23). Recorridos pendientes de confirmar.
export const CNCUYO_11090 = {
    $110: '3000.000',
    $111: '3000.000',
};
