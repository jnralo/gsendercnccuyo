// Catálogo de modelos CNC Cuyo.
// Cada modelo apunta a un perfil de máquina (id) definido en
// features/Config/assets/MachineDefaults/defaultMachineProfiles.ts
//
// Cada modelo tiene un banner 4:3 en ./images (logo, número de fondo, ilustración de
// la ficha técnica y datos). El nombre y los datos ya están dibujados en el banner.

import img6040 from './images/6040.webp';
import img9060 from './images/9060.webp';
import img11090 from './images/11090.webp';
import img6040Smart from './images/6040-smart.webp';
import img9060Smart from './images/9060-smart.webp';
import img11090Smart from './images/11090-smart.webp';

export interface CatalogModel {
    profileId: number;
    name: string;
    /** Descripción breve, una sola línea. */
    summary: string;
    /** Banner 4:3 del modelo */
    image: string;
}

export interface CatalogLine {
    title: string;
    description: string;
    models: CatalogModel[];
}

export const CNCUYO_LINES: CatalogLine[] = [
    {
        title: 'Línea estándar',
        description: 'Arduino Uno + GRBL, conexión por USB.',
        models: [
            {
                profileId: 200,
                image: img6040,
                name: 'CNC Cuyo 6040',
                summary: 'El modelo compacto.',
            },
            {
                profileId: 201,
                image: img9060,
                name: 'CNC Cuyo 9060',
                summary: 'Motores NEMA 17, hasta 2.000 mm/min.',
            },
            {
                profileId: 202,
                image: img11090,
                name: 'CNC Cuyo 11090',
                summary: 'Motores NEMA 23, hasta 3.000 mm/min.',
            },
        ],
    },
    {
        title: 'Línea Smart',
        description:
            'Placa MKS DLC32, drivers TMC2209, Wi-Fi y pendant opcional.',
        models: [
            {
                profileId: 203,
                image: img6040Smart,
                name: 'CNC Cuyo 6040 Smart',
                summary: 'El compacto, con electrónica Smart.',
            },
            {
                profileId: 204,
                image: img9060Smart,
                name: 'CNC Cuyo 9060 Smart',
                summary: 'El 9060, con electrónica Smart.',
            },
            {
                profileId: 205,
                image: img11090Smart,
                name: 'CNC Cuyo 11090 Smart',
                summary: 'El 11090, con electrónica Smart.',
            },
        ],
    },
];
