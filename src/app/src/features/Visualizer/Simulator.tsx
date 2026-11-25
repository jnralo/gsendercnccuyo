import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import pubsub from 'pubsub-js';
import { LuPause, LuPlay, LuRotateCcw, LuX } from 'react-icons/lu';

import { RootState } from 'app/store/redux';

// Lineas de G-code que avanza la simulacion en cada paso (20 pasos por segundo)
const SPEEDS = [
    { label: 'x1', linesPerTick: 1 },
    { label: 'x5', linesPerTick: 5 },
    { label: 'x25', linesPerTick: 25 },
    { label: 'x100', linesPerTick: 100 },
];
const TICK_MS = 50;

const iconButton =
    'h-8 w-8 flex items-center justify-center rounded border border-gray-400 bg-white text-gray-800 hover:bg-gray-200 dark:bg-dark dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700';

/**
 * Simulador de G-code: recorre el archivo cargado linea por linea en el visualizador,
 * sin mover la maquina. Solo dibuja; no envia ningun comando a la controladora.
 */
export function Simulator() {
    const fileLoaded = useSelector((state: RootState) => state.file.fileLoaded);
    const total = useSelector((state: RootState) => state.file.total);
    const workflowState = useSelector(
        (state: RootState) => state.controller.workflow.state,
    );
    const isIdle = workflowState === 'idle';

    const [active, setActive] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [line, setLine] = useState(0);
    const [speedIndex, setSpeedIndex] = useState(1);
    const lineRef = useRef(0);

    const goTo = (value: number) => {
        const next = Math.max(0, Math.min(total, value));
        lineRef.current = next;
        setLine(next);
        pubsub.publish('simulate:frame', next);
    };

    const exit = () => {
        setPlaying(false);
        setActive(false);
        lineRef.current = 0;
        setLine(0);
        pubsub.publish('simulate:stop');
    };

    // Avance automatico
    useEffect(() => {
        if (!active || !playing) {
            return;
        }
        const timer = setInterval(() => {
            const next = lineRef.current + SPEEDS[speedIndex].linesPerTick;
            if (next >= total) {
                goTo(total);
                setPlaying(false);
                return;
            }
            goTo(next);
        }, TICK_MS);
        return () => clearInterval(timer);
    }, [active, playing, speedIndex, total]);

    // Si arranca un trabajo real o se quita el archivo, se sale de la simulacion
    useEffect(() => {
        if (active && (!isIdle || !fileLoaded)) {
            exit();
        }
    }, [active, isIdle, fileLoaded]);

    if (!fileLoaded || !isIdle || total === 0) {
        return null;
    }

    if (!active) {
        return (
            <div
                className="absolute top-2 left-1/2 -translate-x-1/2 z-10"
                data-no-translate
            >
                <button
                    type="button"
                    className="h-8 px-3 flex items-center gap-2 rounded border border-gray-400 bg-white text-gray-800 text-sm font-semibold hover:bg-gray-200 dark:bg-dark dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    title="Ver el recorrido del trabajo sin mover la máquina"
                    data-tour="simulate"
                    onClick={() => {
                        setActive(true);
                        goTo(0);
                        setPlaying(true);
                    }}
                >
                    <LuPlay /> Simular
                </button>
            </div>
        );
    }

    return (
        <div
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-lg border border-gray-400 bg-white/95 px-3 py-2 text-sm text-gray-800 shadow dark:bg-dark/95 dark:text-gray-100 dark:border-gray-600"
            data-no-translate
        >
            <span className="font-semibold">Simulación</span>
            <button
                type="button"
                className={iconButton}
                title={playing ? 'Pausar' : 'Reproducir'}
                onClick={() => {
                    if (!playing && lineRef.current >= total) {
                        goTo(0);
                    }
                    setPlaying(!playing);
                }}
            >
                {playing ? <LuPause /> : <LuPlay />}
            </button>
            <button
                type="button"
                className={iconButton}
                title="Volver al inicio"
                onClick={() => {
                    setPlaying(false);
                    goTo(0);
                }}
            >
                <LuRotateCcw />
            </button>
            <input
                type="range"
                min={0}
                max={total}
                value={line}
                className="w-56"
                onChange={(e) => {
                    setPlaying(false);
                    goTo(Number(e.target.value));
                }}
            />
            <span className="tabular-nums w-28 text-center">
                Línea {line} / {total}
            </span>
            <button
                type="button"
                className={`${iconButton} w-12 font-semibold`}
                title="Velocidad de la simulación"
                onClick={() => setSpeedIndex((speedIndex + 1) % SPEEDS.length)}
            >
                {SPEEDS[speedIndex].label}
            </button>
            <button
                type="button"
                className={iconButton}
                title="Salir de la simulación"
                onClick={exit}
            >
                <LuX />
            </button>
        </div>
    );
}
