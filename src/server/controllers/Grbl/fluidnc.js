/*
 * Compatibilidad con placas FluidNC (ESP32, por ejemplo Arduino R32 o MKS DLC32).
 *
 * En FluidNC los ajustes numerados de Grbl ($100, $110, $120, $130...) son una copia
 * de SOLO LECTURA de su archivo de configuracion (config.yaml): escribirlos devuelve
 * error:162 (ReadOnlySetting). Los valores se cambian con la ruta del archivo de
 * configuracion, por ejemplo "$/axes/x/steps_per_mm=800", y se guardan en el archivo
 * con "$CD=config.yaml".
 *
 * Aca se traducen los ajustes de movimiento por eje, que son los que se editan en la
 * pantalla de Config, en el asistente de calibracion y al restaurar valores de fabrica.
 */

const AXES = ['x', 'y', 'z', 'a', 'b', 'c'];

// Primer numero del grupo de Grbl -> nombre del parametro en el config.yaml de FluidNC
const AXIS_SETTING_GROUPS = {
    100: 'steps_per_mm',
    110: 'max_rate_mm_per_min',
    120: 'acceleration_mm_per_sec2',
    130: 'max_travel_mm',
};

const SETTING_LINE = /^\$(\d{3})\s*=\s*(-?\d+(?:\.\d+)?)\s*$/;

/** Detecta FluidNC en una linea recibida de la placa (mensaje de inicio o $I). */
export const isFluidNCLine = (line) => /fluidnc/i.test(line);

/** Nombre del archivo de configuracion en uso, si la linea lo informa. */
export const parseConfigFileName = (line) => {
    const match = line.match(/Configuration file:\s*([^\s\]]+)/i);
    return match ? match[1] : null;
};

/**
 * Traduce "$100=800" a "$/axes/x/steps_per_mm=800".
 * Devuelve null si la linea no es un ajuste que se pueda traducir.
 */
export const toFluidNCSetting = (line) => {
    const match = String(line).trim().match(SETTING_LINE);
    if (!match) {
        return null;
    }
    const number = Number(match[1]);
    const value = match[2];
    const group = Math.floor(number / 10) * 10;
    const parameter = AXIS_SETTING_GROUPS[group];
    const axis = AXES[number - group];
    if (!parameter || !axis) {
        return null;
    }
    return `$/axes/${axis}/${parameter}=${value}`;
};
