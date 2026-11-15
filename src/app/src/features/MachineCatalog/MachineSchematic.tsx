interface Props {
    /** Ancho util (eje X) en mm */
    width: number;
    /** Largo util (eje Y) en mm */
    depth: number;
}

/**
 * Esquema en planta de la maquina, dibujado a escala con las medidas del perfil.
 * Usa currentColor para verse bien en tema claro y oscuro.
 */
export function MachineSchematic({ width, depth }: Props) {
    const box = 200;
    const margin = 18;
    const inner = box - margin * 2;
    // Eje Y se dibuja horizontal (lado largo), eje X (portico) vertical
    const scale = inner / Math.max(width, depth);
    const w = depth * scale; // horizontal = Y
    const h = width * scale; // vertical = X
    const x0 = (box - w) / 2;
    const y0 = (box - h) / 2;

    return (
        <svg
            viewBox={`0 0 ${box} ${box}`}
            className="w-full h-full text-gray-600 dark:text-gray-300"
            role="img"
            aria-label={`Esquema de la maquina, ${width} por ${depth} milimetros`}
        >
            <rect
                x={x0 - 8}
                y={y0 - 8}
                width={w + 16}
                height={h + 16}
                rx={6}
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
            />
            <rect
                x={x0}
                y={y0}
                width={w}
                height={h}
                fill="currentColor"
                fillOpacity={0.12}
                stroke="currentColor"
                strokeWidth={1}
                strokeDasharray="4 3"
            />
            {/* Portico */}
            <rect
                x={x0 + w * 0.3}
                y={y0 - 12}
                width={10}
                height={h + 24}
                rx={3}
                fill="currentColor"
            />
            {/* Carro con fresadora */}
            <circle cx={x0 + w * 0.3 + 5} cy={y0 + h * 0.45} r={9} fill="currentColor" />
            <text
                x={box / 2}
                y={box - 3}
                textAnchor="middle"
                fontSize={11}
                fill="currentColor"
            >
                {depth} x {width} mm
            </text>
        </svg>
    );
}
