// Catálogo de modelos CNC Cuyo.
// Cada modelo apunta a un perfil de máquina (id) definido en
// features/Config/assets/MachineDefaults/defaultMachineProfiles.ts
//
// Por ahora cada tarjeta muestra un esquema dibujado a escala con las medidas del
// perfil. Cuando estén las imágenes reales, se agrega un campo de imagen por modelo.

export interface CatalogModel {
    profileId: number;
    name: string;
    /** Descripción breve, una sola línea. */
    summary: string;
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
                name: 'CNC Cuyo 6040',
                summary: 'El modelo compacto.',
            },
            {
                profileId: 201,
                name: 'CNC Cuyo 9060',
                summary: 'Motores NEMA 17, hasta 2.000 mm/min.',
            },
            {
                profileId: 202,
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
                name: 'CNC Cuyo 6040 Smart',
                summary: 'El compacto, con electrónica Smart.',
            },
            {
                profileId: 204,
                name: 'CNC Cuyo 9060 Smart',
                summary: 'El 9060, con electrónica Smart.',
            },
            {
                profileId: 205,
                name: 'CNC Cuyo 11090 Smart',
                summary: 'El 11090, con electrónica Smart.',
            },
        ],
    },
];
