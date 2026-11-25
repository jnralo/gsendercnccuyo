import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import pubsub from 'pubsub-js';

import { Illustration } from './Illustration';
import { TOURS, TourId } from './tours';

const MARGIN = 12;
const PADDING = 6;

interface Box {
    top: number;
    left: number;
    width: number;
    height: number;
}

const sameBox = (a: Box | null, b: Box | null) =>
    a === b ||
    (!!a &&
        !!b &&
        Math.abs(a.top - b.top) < 1 &&
        Math.abs(a.left - b.left) < 1 &&
        Math.abs(a.width - b.width) < 1 &&
        Math.abs(a.height - b.height) < 1);

function findTarget(target?: string): Box | null {
    if (!target) {
        return null;
    }
    const selector = target.startsWith('#') ? target : `[data-tour="${target}"]`;
    const element = document.querySelector(selector);
    if (!element) {
        return null;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        return null;
    }
    return {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
    };
}

/** Ubica la tarjeta al lado del elemento resaltado, sin salirse de la pantalla. */
function placeCard(target: Box | null, card: { width: number; height: number }) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clamp = (value: number, min: number, max: number) =>
        Math.max(min, Math.min(value, max));

    if (!target) {
        return { left: (vw - card.width) / 2, top: (vh - card.height) / 2 };
    }

    const centerX = target.left + target.width / 2;
    const centerY = target.top + target.height / 2;
    const horizontal = clamp(centerX - card.width / 2, MARGIN, vw - card.width - MARGIN);
    const vertical = clamp(centerY - card.height / 2, MARGIN, vh - card.height - MARGIN);

    if (vh - (target.top + target.height) >= card.height + MARGIN * 2) {
        return { left: horizontal, top: target.top + target.height + MARGIN };
    }
    if (target.top >= card.height + MARGIN * 2) {
        return { left: horizontal, top: target.top - card.height - MARGIN };
    }
    if (vw - (target.left + target.width) >= card.width + MARGIN * 2) {
        return { left: target.left + target.width + MARGIN, top: vertical };
    }
    if (target.left >= card.width + MARGIN * 2) {
        return { left: target.left - card.width - MARGIN, top: vertical };
    }
    return { left: (vw - card.width) / 2, top: (vh - card.height) / 2 };
}

/**
 * Recorridos guiados. Se abren con pubsub 'cncuyo:tour:start' (id del tour).
 * Oscurecen la pantalla, resaltan el boton de cada paso y muestran una tarjeta
 * con la explicacion y, en algunos pasos, una ilustracion animada.
 */
export function TourHost() {
    const navigate = useNavigate();
    const [tourId, setTourId] = useState<TourId | null>(null);
    const [index, setIndex] = useState(0);
    const [target, setTarget] = useState<Box | null>(null);
    const [cardSize, setCardSize] = useState({ width: 380, height: 220 });
    const cardRef = useRef<HTMLDivElement>(null);

    const tour = tourId ? TOURS[tourId] : null;
    const step = tour ? tour.steps[index] : null;
    const isLast = tour ? index === tour.steps.length - 1 : false;

    const close = useCallback(() => {
        setTourId(null);
        setIndex(0);
        setTarget(null);
    }, []);

    useEffect(() => {
        const token = pubsub.subscribe('cncuyo:tour:start', (_, id: TourId) => {
            if (!TOURS[id]) {
                return;
            }
            navigate('/');
            setIndex(0);
            setTourId(id);
        });
        return () => {
            pubsub.unsubscribe(token);
        };
    }, [navigate]);

    // Sigue la posicion del elemento resaltado (la pantalla puede cambiar)
    useEffect(() => {
        if (!step) {
            return;
        }
        const update = () => {
            const next = findTarget(step.target);
            setTarget((prev) => (sameBox(prev, next) ? prev : next));
        };
        update();
        const timer = setInterval(update, 300);
        window.addEventListener('resize', update);
        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', update);
        };
    }, [step]);

    useLayoutEffect(() => {
        if (!cardRef.current) {
            return;
        }
        const rect = cardRef.current.getBoundingClientRect();
        if (
            Math.abs(rect.width - cardSize.width) > 1 ||
            Math.abs(rect.height - cardSize.height) > 1
        ) {
            setCardSize({ width: rect.width, height: rect.height });
        }
    });

    useEffect(() => {
        if (!tour) {
            return;
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            } else if (event.key === 'ArrowRight') {
                setIndex((i) => Math.min(i + 1, tour.steps.length - 1));
            } else if (event.key === 'ArrowLeft') {
                setIndex((i) => Math.max(i - 1, 0));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [tour, close]);

    if (!tour || !step) {
        return null;
    }

    const position = placeCard(target, cardSize);
    const cardWidth = step.illustration ? 460 : 360;

    return createPortal(
        <div
            className="fixed inset-0"
            style={{ zIndex: 1000 }}
            data-no-translate
            role="dialog"
            aria-modal="true"
            aria-label={tour.title}
        >
            {target ? (
                <div
                    className="fixed rounded-lg pointer-events-none"
                    style={{
                        top: target.top,
                        left: target.left,
                        width: target.width,
                        height: target.height,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                        border: '3px solid #F47B20',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <div className="absolute inset-0 rounded-lg animate-pulse ring-4 ring-orange-400/60" />
                </div>
            ) : (
                <div className="fixed inset-0 bg-black/60" />
            )}

            <div
                ref={cardRef}
                className="fixed rounded-xl bg-white dark:bg-dark text-gray-900 dark:text-white shadow-2xl border-t-4 p-4 flex flex-col gap-3"
                style={{
                    width: cardWidth,
                    maxWidth: 'calc(100vw - 24px)',
                    top: position.top,
                    left: position.left,
                    borderTopColor: '#F47B20',
                    transition: 'top 0.3s ease, left 0.3s ease',
                }}
            >
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold uppercase tracking-wide">
                        {tour.title}
                    </span>
                    <span>
                        {index + 1} / {tour.steps.length}
                    </span>
                </div>

                <h2 className="text-lg font-bold leading-tight">{step.title}</h2>

                {step.illustration && <Illustration kind={step.illustration} />}

                <div className="text-sm leading-relaxed">{step.body}</div>

                <div className="flex gap-1">
                    {tour.steps.map((_, i) => (
                        <span
                            key={i}
                            className="h-1.5 flex-1 rounded-full"
                            style={{
                                backgroundColor: i <= index ? '#F47B20' : '#D5D8DC',
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between gap-2">
                    <button
                        type="button"
                        className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                        onClick={close}
                    >
                        Salir del tutorial
                    </button>
                    <div className="flex gap-2">
                        {index > 0 && (
                            <button
                                type="button"
                                className="h-9 px-3 rounded border border-gray-300 text-sm font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                                onClick={() => setIndex(index - 1)}
                            >
                                Atrás
                            </button>
                        )}
                        <button
                            type="button"
                            className="h-9 px-4 rounded text-sm font-semibold text-white hover:opacity-90"
                            style={{ backgroundColor: '#F47B20' }}
                            onClick={() => (isLast ? close() : setIndex(index + 1))}
                        >
                            {isLast ? 'Terminar' : 'Siguiente'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
