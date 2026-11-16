import { useWorkspaceState } from './useWorkspaceState';

/**
 * Vista simple (por defecto): oculta las opciones avanzadas para usuarios nuevos.
 * Se cambia con el boton de la barra superior.
 */
export const useSimpleMode = (): boolean => {
    const workspace = useWorkspaceState() as { simpleMode?: boolean };
    return workspace.simpleMode !== false;
};
