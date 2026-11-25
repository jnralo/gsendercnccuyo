import { useEffect, useRef, useState } from 'react';
import pubsub from 'pubsub-js';
import { LuGraduationCap } from 'react-icons/lu';

const ITEMS = [
    {
        label: 'Primeros pasos',
        description: 'Elegir modelo, conectar y probar la máquina',
        action: () => pubsub.publish('cncuyo:setup:open'),
    },
    {
        label: 'Conocer la pantalla',
        description: 'Para qué sirve cada botón',
        action: () => pubsub.publish('cncuyo:tour:start', 'interface'),
    },
    {
        label: 'Hacer mi primer trabajo',
        description: 'Del archivo a la pieza cortada, paso a paso',
        action: () => pubsub.publish('cncuyo:tour:start', 'first-job'),
    },
];

/** Boton "Tutorial" de la barra superior, con las guias disponibles. */
export function TutorialMenu({ buttonClass }: { buttonClass: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        const onClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                className={`${buttonClass} gap-1`}
                title="Tutoriales"
                data-tour="tutorial"
                onClick={() => setOpen(!open)}
            >
                <LuGraduationCap /> Tutorial
            </button>
            {open && (
                <div className="absolute right-0 top-10 w-72 rounded-lg border border-gray-300 bg-white shadow-xl dark:bg-dark dark:border-gray-600 z-50 overflow-hidden">
                    {ITEMS.map((item) => (
                        <button
                            type="button"
                            key={item.label}
                            className="w-full text-left px-3 py-2 hover:bg-orange-50 dark:hover:bg-gray-700 border-b last:border-b-0 border-gray-200 dark:border-gray-700"
                            onClick={() => {
                                setOpen(false);
                                item.action();
                            }}
                        >
                            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                                {item.label}
                            </span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                                {item.description}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
