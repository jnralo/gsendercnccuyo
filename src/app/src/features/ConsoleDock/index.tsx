import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import { LuTerminal, LuX } from 'react-icons/lu';

import store from 'app/store';
import Console from 'app/features/Console';
import { useWorkspaceState } from 'app/hooks/useWorkspaceState';

import { consoleState, useConsoleOpen } from './consoleState';

export type ConsoleLayout = 1 | 2 | 3 | 4;

const LAYOUTS: { id: ConsoleLayout; title: string }[] = [
    { id: 1, title: 'Abajo, a todo el ancho' },
    { id: 2, title: 'A la derecha' },
    { id: 3, title: 'Ventana flotante (arrastrala desde la barra)' },
    { id: 4, title: 'En el panel de abajo a la derecha' },
];

const ORANGE = '#F47B20';

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const rectOf = (selector: string): Rect | null => {
    const element = document.querySelector(selector);
    if (!element) {
        return null;
    }
    const r = element.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) {
        return null;
    }
    return { top: r.top, left: r.left, width: r.width, height: r.height };
};

const sameRect = (a: Rect | null, b: Rect | null) =>
    a === b ||
    (!!a &&
        !!b &&
        Math.abs(a.top - b.top) < 1 &&
        Math.abs(a.left - b.left) < 1 &&
        Math.abs(a.width - b.width) < 1 &&
        Math.abs(a.height - b.height) < 1);

/**
 * Consola que se abre con el boton "Consola" de la barra superior.
 * Tiene 4 posiciones que el usuario elige con los numeros de su barra:
 * 1 abajo, 2 a la derecha, 3 flotante y 4 en el panel de abajo a la derecha.
 */
export function ConsoleDock() {
    const isOpen = useConsoleOpen();
    const workspace = useWorkspaceState() as { consoleLayout?: number };
    const layout = ([1, 2, 3, 4].includes(Number(workspace.consoleLayout))
        ? Number(workspace.consoleLayout)
        : 4) as ConsoleLayout;

    // Medidas de la pantalla que usan las posiciones 1, 2 y 4
    const [anchors, setAnchors] = useState<{
        nav: Rect | null;
        visualizer: Rect | null;
        tools: Rect | null;
    }>({ nav: null, visualizer: null, tools: null });

    // Ventana flotante
    const [floatBox, setFloatBox] = useState<Rect | null>(null);
    const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(
        null,
    );
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const update = () => {
            const next = {
                nav: rectOf('[data-tour="nav"]'),
                visualizer: rectOf('#visualizer_container'),
                tools: rectOf('[data-tour="tools-panel"]'),
            };
            setAnchors((prev) =>
                sameRect(prev.nav, next.nav) &&
                sameRect(prev.visualizer, next.visualizer) &&
                sameRect(prev.tools, next.tools)
                    ? prev
                    : next,
            );
        };
        update();
        const timer = setInterval(update, 400);
        window.addEventListener('resize', update);
        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', update);
        };
    }, [isOpen]);

    // El terminal se reacomoda con el evento resize de la ventana
    useEffect(() => {
        if (!isOpen || !panelRef.current) {
            return;
        }
        let timeout: ReturnType<typeof setTimeout> | null = null;
        const observer = new ResizeObserver(() => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 150);
        });
        observer.observe(panelRef.current);
        return () => {
            observer.disconnect();
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [isOpen, layout]);

    if (!isOpen) {
        return null;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const topBarBottom = anchors.visualizer ? anchors.visualizer.top - 4 : 56;
    const navRight = anchors.nav ? anchors.nav.left + anchors.nav.width : 0;

    // Sin el panel de herramientas en pantalla (por ejemplo en Config), la
    // posicion 4 se muestra como ventana flotante
    const effective: ConsoleLayout = layout === 4 && !anchors.tools ? 3 : layout;

    const defaultFloat: Rect = {
        width: 520,
        height: 360,
        left: anchors.visualizer
            ? anchors.visualizer.left + anchors.visualizer.width - 540
            : vw - 560,
        top: anchors.visualizer ? anchors.visualizer.top + 50 : 120,
    };
    const float = floatBox ?? defaultFloat;

    let style: CSSProperties;
    if (effective === 1) {
        style = {
            left: navRight,
            right: 0,
            bottom: 0,
            height: Math.max(220, Math.round(vh * 0.35)),
            borderTop: `3px solid ${ORANGE}`,
            borderRadius: '10px 10px 0 0',
        };
    } else if (effective === 2) {
        style = {
            right: 0,
            top: topBarBottom,
            bottom: 0,
            width: Math.min(460, Math.round(vw * 0.32)),
            borderLeft: `3px solid ${ORANGE}`,
            borderRadius: '10px 0 0 10px',
        };
    } else if (effective === 3) {
        style = {
            left: Math.max(0, Math.min(float.left, vw - 200)),
            top: Math.max(0, Math.min(float.top, vh - 80)),
            width: float.width,
            height: float.height,
            border: `2px solid ${ORANGE}`,
            borderRadius: 10,
            resize: 'both',
            minWidth: 320,
            minHeight: 200,
        };
    } else {
        const tools = anchors.tools as Rect;
        style = {
            left: tools.left,
            top: tools.top,
            width: tools.width,
            height: tools.height,
            border: `2px solid ${ORANGE}`,
            borderRadius: 8,
        };
    }

    const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (effective !== 3 || (event.target as HTMLElement).closest('button')) {
            return;
        }
        const box = panelRef.current?.getBoundingClientRect();
        if (!box) {
            return;
        }
        dragRef.current = {
            x: event.clientX,
            y: event.clientY,
            left: box.left,
            top: box.top,
        };
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    };

    const onDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        const box = panelRef.current?.getBoundingClientRect();
        if (!drag || !box) {
            return;
        }
        setFloatBox({
            left: drag.left + event.clientX - drag.x,
            top: drag.top + event.clientY - drag.y,
            width: box.width,
            height: box.height,
        });
    };

    const endDrag = () => {
        const box = panelRef.current?.getBoundingClientRect();
        dragRef.current = null;
        if (effective === 3 && box) {
            // conserva el tamano si el usuario lo cambio desde la esquina
            setFloatBox({
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
            });
        }
    };

    const chooseLayout = (id: ConsoleLayout) => {
        store.set('workspace.consoleLayout', id);
    };

    return createPortal(
        <div
            ref={panelRef}
            className="fixed flex flex-col overflow-hidden bg-white dark:bg-dark shadow-2xl"
            style={{ zIndex: 900, ...style }}
            data-no-translate
            aria-label="Consola"
        >
            <div
                className={cx(
                    'flex items-center justify-between gap-2 px-2 py-1 bg-gray-800 text-white select-none',
                    { 'cursor-move': effective === 3 },
                )}
                onPointerDown={startDrag}
                onPointerMove={onDrag}
                onPointerUp={endDrag}
            >
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ backgroundColor: ORANGE }}
                    >
                        <LuTerminal />
                    </span>
                    Consola
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-300 mr-1 max-xl:hidden">
                        Posición
                    </span>
                    {LAYOUTS.map((item) => (
                        <button
                            type="button"
                            key={item.id}
                            title={item.title}
                            onClick={() => chooseLayout(item.id)}
                            className={cx(
                                'w-7 h-7 rounded text-sm font-bold border',
                                layout === item.id
                                    ? 'text-white border-transparent'
                                    : 'text-gray-200 border-gray-600 hover:bg-gray-700',
                            )}
                            style={
                                layout === item.id
                                    ? { backgroundColor: ORANGE }
                                    : undefined
                            }
                        >
                            {item.id}
                        </button>
                    ))}
                    <button
                        type="button"
                        title="Cerrar la consola"
                        onClick={() => consoleState.setOpen(false)}
                        className="ml-1 w-7 h-7 rounded flex items-center justify-center text-gray-200 border border-gray-600 hover:bg-gray-700"
                    >
                        <LuX />
                    </button>
                </div>
            </div>
            <div className="relative flex-1 min-h-0">
                <Console isActive />
            </div>
        </div>,
        document.body,
    );
}
