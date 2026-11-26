import { LuMoon, LuSun, LuTerminal } from 'react-icons/lu';
import cx from 'classnames';

import store from 'app/store';
import { useWorkspaceState } from 'app/hooks/useWorkspaceState';
import { useSimpleMode } from 'app/hooks/useSimpleMode';
import { setLanguage } from 'app/lib/translate';
import { TutorialMenu } from 'app/features/Tutorial/TutorialMenu';
import {
    consoleState,
    useConsoleOpen,
} from 'app/features/ConsoleDock/consoleState';

const buttonClass =
    'h-8 min-w-8 px-2 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-200 dark:bg-dark dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700';

/** Accesos rapidos de la barra superior: vista simple/avanzada, tema e idioma. */
export function QuickSettings() {
    const workspace = useWorkspaceState() as {
        enableDarkMode?: boolean;
        language?: string;
    };
    const simpleMode = useSimpleMode();
    const consoleOpen = useConsoleOpen();
    const isDark = Boolean(workspace.enableDarkMode);
    const isSpanish = workspace.language !== 'en';

    // A la derecha, al lado de los iconos de estado: a la izquierda chocaba con la
    // informacion de la maquina. z-10 porque la capa central transparente de la
    // barra queda por encima y se llevaria los clics.
    return (
        <div
            className="absolute top-3 max-xl:top-2 right-48 z-10 flex items-center gap-1 max-sm:hidden"
            data-no-translate
            data-tour="quick-settings"
        >
            <button
                type="button"
                className={cx(buttonClass, 'gap-1', {
                    '!border-orange-500 !bg-orange-50 !text-orange-700 dark:!bg-orange-950 dark:!text-orange-300':
                        consoleOpen,
                })}
                title={consoleOpen ? 'Ocultar la consola' : 'Mostrar la consola'}
                data-tour="console-button"
                onClick={() => consoleState.toggle()}
            >
                <LuTerminal />
                {/* En pantallas chicas solo el icono, para no pisar el estado */}
                <span className="max-2xl:hidden">Consola</span>
            </button>
            <TutorialMenu buttonClass={buttonClass} />
            <button
                type="button"
                className={buttonClass}
                title={
                    simpleMode
                        ? 'Cambiar a vista avanzada'
                        : 'Cambiar a vista simple'
                }
                onClick={() => store.set('workspace.simpleMode', !simpleMode)}
            >
                {simpleMode ? 'Simple' : 'Avanzado'}
            </button>
            <button
                type="button"
                className={buttonClass}
                title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                onClick={() => store.set('workspace.enableDarkMode', !isDark)}
            >
                {isDark ? <LuSun /> : <LuMoon />}
            </button>
            <button
                type="button"
                className={buttonClass}
                title={isSpanish ? 'Switch to English' : 'Cambiar a español'}
                onClick={() => setLanguage(isSpanish ? 'en' : 'es')}
            >
                {isSpanish ? 'ES' : 'EN'}
            </button>
        </div>
    );
}
