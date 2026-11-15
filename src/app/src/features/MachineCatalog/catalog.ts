// Catálogo de modelos CNC Cuyo.
// Cada modelo apunta a un perfil de máquina (id) definido en
// features/Config/assets/MachineDefaults/defaultMachineProfiles.ts
//
// Por ahora cada tarjeta muestra un esquema dibujado a escala con las medidas del
// perfil. Cuando haya fotos reales, se agrega un campo de imagen por modelo.

export interface CatalogModel {
    profileId: number;
    name: string;
    summary: string;
    specs: string[];
    /** Explica qué datos faltan confirmar. Si existe, la tarjeta muestra un aviso. */
    pending?: string;
}

export const CNCUYO_MODELS: CatalogModel[] = [
    {
        profileId: 200,
        name: 'CNC Cuyo 6040',
        summary: 'El modelo compacto de la línea.',
        specs: [],
        pending: 'Faltan confirmar las medidas y especificaciones.',
    },
    {
        profileId: 201,
        name: 'CNC Cuyo 9060',
        summary: 'Router CNC armado, listo para colocar la fresadora.',
        specs: [
            'Área útil: 600 x 900 mm',
            'Motores NEMA 17 de alto torque (aprox. 25 kgf por eje)',
            'Varilla roscada trapezoidal con tuerca de bronce',
            'Guías de acero con rodamientos recirculantes',
            'Fresadora de 1 HP (710 W, hasta 28.000 RPM)',
            'Avance máximo: 2.000 mm/min',
            'Arduino Uno + GRBL por USB',
        ],
    },
    {
        profileId: 202,
        name: 'CNC Cuyo 11090',
        summary: 'La versión grande, con motores más potentes.',
        specs: [
            'Área útil: 1100 x 900 mm',
            'Motores NEMA 23 de 4 N·m (aprox. 60 kgf de empuje)',
            'Avance máximo: 3.000 mm/min',
            'Arduino Uno + GRBL por USB',
        ],
        pending:
            'Falta confirmar la orientación de los ejes X/Y y el recorrido en Z.',
    },
];
