import cnc9060 from './images/cnc9060.webp';

// Ilustraciones animadas de los tutoriales. La base es el dibujo de la ficha tecnica
// del 9060 y encima se animan la madera, el origen, el recorrido de la fresa, etc.
// Las coordenadas estan en pixeles de la imagen original (1863 x 1012).

export type IllustrationKind = 'board' | 'xy' | 'z' | 'zero' | 'spindle' | 'carve';

type Point = [number, number];

// Esquinas de la superficie de la mesa en la imagen
const FL: Point = [975, 876]; // delantera izquierda
const FR: Point = [1755, 626]; // delantera derecha
const BL: Point = [112, 343]; // trasera izquierda
const BR: Point = [862, 128]; // trasera derecha

/** Punto de la mesa: u va de izquierda a derecha (X), v de adelante hacia atras (Y). */
const P = (u: number, v: number): Point => [
    (1 - u) * (1 - v) * FL[0] + u * (1 - v) * FR[0] + (1 - u) * v * BL[0] + u * v * BR[0],
    (1 - u) * (1 - v) * FL[1] + u * (1 - v) * FR[1] + (1 - u) * v * BL[1] + u * v * BR[1],
];

// Madera de trabajo (zona libre de la mesa, detras del portico)
const U0 = 0.05;
const U1 = 0.4;
const V0 = 0.55;
const V1 = 0.92;
const ORIGIN = P(U0, V0);
const BOARD_X = P(U1, V0);
const BOARD_Y = P(U0, V1);
const BOARD = [ORIGIN, BOARD_X, P(U1, V1), BOARD_Y];
const BOARD_THICKNESS = 22;

// Punta de la fresa en el dibujo
const BIT: Point = [1218, 672];

const ORANGE = '#F47B20';
const pts = (list: Point[]) => list.map((p) => p.join(',')).join(' ');

/** Matriz SVG que lleva coordenadas locales de la madera (0..100) al dibujo. */
const boardMatrix = () => {
    const a = (BOARD_X[0] - ORIGIN[0]) / 100;
    const b = (BOARD_X[1] - ORIGIN[1]) / 100;
    const c = (BOARD_Y[0] - ORIGIN[0]) / 100;
    const d = (BOARD_Y[1] - ORIGIN[1]) / 100;
    return `matrix(${a} ${b} ${c} ${d} ${ORIGIN[0]} ${ORIGIN[1]})`;
};

// Recorrido de ejemplo (en coordenadas locales de la madera)
const CARVE_PATH =
    'M 15 15 L 85 15 L 85 85 L 15 85 Z M 30 50 A 20 20 0 1 0 70 50 A 20 20 0 1 0 30 50 M 22 30 Q 36 20 50 30 T 78 30';

function Board({ drop = false }: { drop?: boolean }) {
    const side = BOARD.map(([x, y]) => [x, y + BOARD_THICKNESS] as Point);
    const content = (
        <g>
            {/* canto */}
            <polygon
                points={pts([BOARD[0], BOARD[1], side[1], side[0]])}
                fill="#B36F33"
                stroke="#111"
                strokeWidth={3}
            />
            <polygon
                points={pts([BOARD[0], BOARD[3], side[3], side[0]])}
                fill="#9C5E2A"
                stroke="#111"
                strokeWidth={3}
            />
            {/* cara superior */}
            <polygon
                points={pts(BOARD)}
                fill="#EBA455"
                stroke="#111"
                strokeWidth={3}
            />
            {[0.25, 0.5, 0.75].map((t) => {
                const a = P(U0 + (U1 - U0) * 0.04, V0 + (V1 - V0) * t);
                const b = P(U1 - (U1 - U0) * 0.04, V0 + (V1 - V0) * (t + 0.03));
                return (
                    <line
                        key={t}
                        x1={a[0]}
                        y1={a[1]}
                        x2={b[0]}
                        y2={b[1]}
                        stroke="#C9823C"
                        strokeWidth={5}
                    />
                );
            })}
        </g>
    );

    if (!drop) {
        return content;
    }
    return (
        <g>
            <animateTransform
                attributeName="transform"
                type="translate"
                values="0 -160; 0 0"
                dur="0.9s"
                fill="freeze"
            />
            <animate attributeName="opacity" values="0;1" dur="0.6s" fill="freeze" />
            {content}
        </g>
    );
}

function Clamps() {
    const spots: Point[] = [
        P(U0 + 0.03, V0 + 0.02),
        P(U1 - 0.03, V0 + 0.02),
        P(U0 + 0.03, V1 - 0.02),
        P(U1 - 0.03, V1 - 0.02),
    ];
    return (
        <g opacity={0}>
            <animate
                attributeName="opacity"
                values="0;1"
                begin="1s"
                dur="0.5s"
                fill="freeze"
            />
            {spots.map(([x, y]) => (
                <g key={`${x}-${y}`}>
                    <rect
                        x={x - 22}
                        y={y - 30}
                        width={44}
                        height={22}
                        rx={5}
                        fill="#2B2C30"
                        stroke="#111"
                        strokeWidth={3}
                    />
                    <rect x={x - 5} y={y - 50} width={10} height={24} fill="#9AA0A6" />
                </g>
            ))}
        </g>
    );
}

function Pulse({ at, color = ORANGE }: { at: Point; color?: string }) {
    return (
        <g>
            {[0, 0.8].map((delay) => (
                <circle
                    key={delay}
                    cx={at[0]}
                    cy={at[1]}
                    r={12}
                    fill="none"
                    stroke={color}
                    strokeWidth={6}
                >
                    <animate
                        attributeName="r"
                        values="12;70"
                        dur="1.6s"
                        begin={`${delay}s`}
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="1;0"
                        dur="1.6s"
                        begin={`${delay}s`}
                        repeatCount="indefinite"
                    />
                </circle>
            ))}
            <circle cx={at[0]} cy={at[1]} r={13} fill={color} stroke="#111" strokeWidth={3} />
        </g>
    );
}

function Label({ at, text, color = '#111' }: { at: Point; text: string; color?: string }) {
    const width = text.length * 34 + 48;
    return (
        <g>
            <rect
                x={at[0] - width / 2}
                y={at[1] - 44}
                width={width}
                height={72}
                rx={16}
                fill={color}
            />
            <text
                x={at[0]}
                y={at[1] + 9}
                textAnchor="middle"
                fontFamily="Inter, Arial, sans-serif"
                fontWeight={800}
                fontSize={52}
                fill="#fff"
            >
                {text}
            </text>
        </g>
    );
}

function Arrow({
    from,
    to,
    color,
    label,
}: {
    from: Point;
    to: Point;
    color: string;
    label: string;
}) {
    const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
    const head = (offset: number): Point => [
        to[0] - 48 * Math.cos(angle + offset),
        to[1] - 48 * Math.sin(angle + offset),
    ];
    return (
        <g>
            <line
                x1={from[0]}
                y1={from[1]}
                x2={to[0]}
                y2={to[1]}
                stroke={color}
                strokeWidth={16}
                strokeLinecap="round"
            />
            <polygon points={pts([to, head(0.45), head(-0.45)])} fill={color} />
            <text
                x={to[0] + 44 * Math.cos(angle)}
                y={to[1] + 44 * Math.sin(angle) + 22}
                textAnchor="middle"
                fontFamily="Inter, Arial, sans-serif"
                fontWeight={900}
                fontSize={64}
                fill={color}
                stroke="#fff"
                strokeWidth={6}
                paintOrder="stroke"
            >
                {label}
            </text>
        </g>
    );
}

const AXIS_X = '#E0262B';
const AXIS_Y = '#1D8F3A';
const AXIS_Z = '#2563EB';

function XYArrows() {
    const xEnd = P(U0 + 0.26, V0);
    const yEnd = P(U0, V0 + 0.26);
    return (
        <g>
            <Arrow from={ORIGIN} to={xEnd} color={AXIS_X} label="X" />
            <Arrow from={ORIGIN} to={yEnd} color={AXIS_Y} label="Y" />
        </g>
    );
}

function ToolTravel() {
    const path = `M ${BIT[0]} ${BIT[1]} Q ${(BIT[0] + ORIGIN[0]) / 2} ${ORIGIN[1] + 60} ${ORIGIN[0]} ${ORIGIN[1]}`;
    return (
        <g>
            <path
                d={path}
                fill="none"
                stroke={ORANGE}
                strokeWidth={6}
                strokeDasharray="18 14"
            >
                <animate
                    attributeName="stroke-dashoffset"
                    values="64;0"
                    dur="0.8s"
                    repeatCount="indefinite"
                />
            </path>
            <g>
                <circle r={20} fill={ORANGE} stroke="#111" strokeWidth={4} />
                <circle r={7} fill="#fff" />
                <animateMotion dur="2.6s" repeatCount="indefinite" path={path} />
            </g>
        </g>
    );
}

function CarvePath({ animated }: { animated: boolean }) {
    return (
        <g transform={boardMatrix()}>
            <path
                d={CARVE_PATH}
                fill="none"
                stroke="#5B3A1A"
                strokeWidth={7}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={animated ? '1 1' : undefined}
            >
                {animated && (
                    <animate
                        attributeName="stroke-dashoffset"
                        values="1;0"
                        dur="5s"
                        repeatCount="indefinite"
                    />
                )}
            </path>
            {animated && (
                <g>
                    <ellipse rx={2.4} ry={2.4} fill={ORANGE} stroke="#111" strokeWidth={0.6} />
                    <animateMotion dur="5s" repeatCount="indefinite" path={CARVE_PATH} />
                </g>
            )}
        </g>
    );
}

const MID_VIEW = '70 80 1320 700';
const SPINDLE_VIEW = '1010 300 430 470';
const BOARD_VIEW = (() => {
    const xs = BOARD.map((p) => p[0]);
    const ys = BOARD.map((p) => p[1]);
    const minX = Math.min(...xs) - 120;
    const minY = Math.min(...ys) - 110;
    const w = Math.max(...xs) - minX + 160;
    const h = Math.max(...ys) - minY + 150;
    return `${minX} ${minY} ${w} ${h}`;
})();

/** Ilustracion animada para un paso del tutorial. */
export function Illustration({ kind }: { kind: IllustrationKind }) {
    const viewBox =
        kind === 'z' || kind === 'spindle'
            ? SPINDLE_VIEW
            : kind === 'zero' || kind === 'carve'
              ? BOARD_VIEW
              : MID_VIEW;

    return (
        <svg
            key={kind}
            viewBox={viewBox}
            className="w-full h-56 rounded-lg bg-gray-100 dark:bg-gray-200"
            role="img"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
        >
            <image href={cnc9060} x={0} y={0} width={1863} height={1012} />

            {kind === 'board' && (
                <>
                    <Board drop />
                    <Clamps />
                </>
            )}

            {kind === 'xy' && (
                <>
                    <Board />
                    <XYArrows />
                    <ToolTravel />
                    <Label at={[ORIGIN[0] - 20, ORIGIN[1] + 90]} text="Origen" color={ORANGE} />
                </>
            )}

            {kind === 'z' && (
                <g>
                    {/* papel bajo la fresa */}
                    <polygon
                        points={pts([
                            [BIT[0] - 70, BIT[1] + 52],
                            [BIT[0] + 20, BIT[1] + 24],
                            [BIT[0] + 92, BIT[1] + 58],
                            [BIT[0] + 2, BIT[1] + 86],
                        ])}
                        fill="#fff"
                        stroke="#111"
                        strokeWidth={3}
                    />
                    <g>
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            values="0 -34; 0 6; 0 -34"
                            dur="1.6s"
                            repeatCount="indefinite"
                        />
                        <line
                            x1={BIT[0] + 120}
                            y1={BIT[1] - 150}
                            x2={BIT[0] + 120}
                            y2={BIT[1] - 30}
                            stroke={AXIS_Z}
                            strokeWidth={14}
                            strokeLinecap="round"
                        />
                        <polygon
                            points={pts([
                                [BIT[0] + 120, BIT[1] + 10],
                                [BIT[0] + 96, BIT[1] - 34],
                                [BIT[0] + 144, BIT[1] - 34],
                            ])}
                            fill={AXIS_Z}
                        />
                        <text
                            x={BIT[0] + 168}
                            y={BIT[1] - 80}
                            fontFamily="Inter, Arial, sans-serif"
                            fontWeight={900}
                            fontSize={44}
                            fill={AXIS_Z}
                            stroke="#fff"
                            strokeWidth={6}
                            paintOrder="stroke"
                        >
                            Z-
                        </text>
                    </g>
                </g>
            )}

            {kind === 'zero' && (
                <>
                    <Board />
                    <XYArrows />
                    <Pulse at={ORIGIN} />
                    <Label at={[ORIGIN[0] + 10, ORIGIN[1] + 92]} text="X0 Y0 Z0" color="#111" />
                </>
            )}

            {kind === 'spindle' && (
                <g>
                    {[0, 1, 2].map((i) => (
                        <ellipse
                            key={i}
                            cx={BIT[0]}
                            cy={BIT[1] - 6}
                            rx={58 + i * 22}
                            ry={20 + i * 8}
                            fill="none"
                            stroke={ORANGE}
                            strokeWidth={9}
                            strokeDasharray="30 22"
                            opacity={1 - i * 0.25}
                        >
                            <animate
                                attributeName="stroke-dashoffset"
                                values="0;-104"
                                dur={`${0.5 + i * 0.2}s`}
                                repeatCount="indefinite"
                            />
                        </ellipse>
                    ))}
                    <Label at={[BIT[0] + 10, BIT[1] - 330]} text="ON" color="#1D8F3A" />
                </g>
            )}

            {kind === 'carve' && (
                <>
                    <Board />
                    <CarvePath animated />
                </>
            )}
        </svg>
    );
}
