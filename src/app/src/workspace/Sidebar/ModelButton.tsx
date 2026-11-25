import { NavLink } from 'react-router';
import cn from 'classnames';
import { FaThLarge } from 'react-icons/fa';

import { useWorkspaceState } from 'app/hooks/useWorkspaceState';

/** Acceso al catalogo de modelos, ubicado debajo del logo. Muestra el modelo elegido. */
export function ModelButton() {
    const workspace = useWorkspaceState() as {
        machineProfile?: { name?: string; company?: string };
    };
    const profile = workspace.machineProfile;
    const shortName =
        profile?.company === 'CNC Cuyo' && profile.name
            ? profile.name.replace('CNC Cuyo ', '')
            : 'Elegir';

    return (
        <NavLink
            to="/models"
            title="Elegir modelo de máquina"
            data-tour="model"
            data-no-translate
            className={({ isActive }) =>
                cn(
                    'flex w-full flex-col items-center gap-0.5 py-2 text-gray-500 dark:text-gray-400 hover:text-blue-500',
                    isActive && 'text-blue-500 dark:text-blue-400',
                )
            }
        >
            <FaThLarge className="text-2xl" />
            <span className="text-xs">Modelo</span>
            <span className="text-[10px] font-semibold leading-tight text-center">
                {shortName}
            </span>
        </NavLink>
    );
}
