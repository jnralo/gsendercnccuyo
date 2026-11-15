// Drivers USB de las placas que usan las máquinas CNC.
//
// `installer`: id que entiende el proceso principal de Electron ('drivers:install', ver main.js).
// Los archivos instaladores viven en electron-build/drivers/ y se copian a la carpeta
// "drivers" de la aplicación al compilar (ver electron-build/drivers/LEEME.txt).
// Si el instalador no está incluido, la pantalla ofrece ir al sitio del fabricante.

export interface DriverInfo {
    id: 'ch340' | 'cp210x' | 'ftdi' | 'arduino';
    name: string;
    chip: string;
    boards: string;
    usbIds: string;
    description: string;
    /** Palabras (en minúsculas) para reconocer el fabricante en la lista de puertos */
    manufacturerHints: string[];
    /** true si hay instalador incluido en el programa para este driver */
    hasInstaller: boolean;
    url: string;
}

export const DRIVERS: DriverInfo[] = [
    {
        id: 'ch340',
        name: 'Driver CH340 / CH341',
        chip: 'WCH CH340 / CH341',
        boards: 'Arduino Uno y Nano compatibles (clones)',
        usbIds: 'USB 1A86:7523',
        description:
            'Es el más común en placas Arduino económicas. Si al conectar la máquina no aparece ningún puerto COM, probablemente necesites este driver.',
        manufacturerHints: ['wch', '1a86'],
        hasInstaller: true,
        url: 'https://www.wch-ic.com/downloads/CH341SER_EXE.html',
    },
    {
        id: 'cp210x',
        name: 'Driver CP210x',
        chip: 'Silicon Labs CP2102 / CP2104',
        boards: 'ESP32 y placas con conversor CP210x',
        usbIds: 'USB 10C4:EA60',
        description:
            'Lo usan muchas placas de desarrollo y controladoras GRBL más nuevas.',
        manufacturerHints: ['silicon labs', 'silabs', '10c4'],
        hasInstaller: true,
        url: 'https://www.silabs.com/developer-tools/usb-to-uart-bridge-vcp-drivers',
    },
    {
        id: 'ftdi',
        name: 'Driver FTDI',
        chip: 'FTDI FT232R',
        boards: 'Placas y cables USB-serie con chip FTDI',
        usbIds: 'USB 0403:6001',
        description:
            'Usado en cables y placas de mayor calidad. Windows suele instalarlo solo por Windows Update.',
        manufacturerHints: ['ftdi', '0403'],
        hasInstaller: true,
        url: 'https://ftdichip.com/drivers/vcp-drivers/',
    },
    {
        id: 'arduino',
        name: 'Arduino original',
        chip: 'ATmega16U2',
        boards: 'Arduino Uno original (R3)',
        usbIds: 'USB 2341:0043',
        description:
            'Windows 10 y 11 lo reconocen solos. Si no aparece el puerto, instalá el Arduino IDE o los drivers desde la página oficial.',
        manufacturerHints: ['arduino', '2341'],
        hasInstaller: false,
        url: 'https://www.arduino.cc/en/software',
    },
];
