import { LuMoon, LuSun } from 'react-icons/lu';

import store from 'app/store';
import { useWorkspaceState } from 'app/hooks/useWorkspaceState';
import { setLanguage } from 'app/lib/translate';

const buttonClass =
    'h-8 min-w-8 px-2 flex items-center justify-center rounded border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-200 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700';

/** Accesos rapidos de la barra superior: tema claro/oscuro e idioma. */
export function QuickSettings() {
    const workspace = useWorkspaceState() as {
        enableDarkMode?: boolean;
        language?: string;
    };
    const isDark = Boolean(workspace.enableDarkMode);
    const isSpanish = workspace.language !== 'en';

    return (
        <div className="flex items-center gap-1 max-sm:hidden" data-no-translate>
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
