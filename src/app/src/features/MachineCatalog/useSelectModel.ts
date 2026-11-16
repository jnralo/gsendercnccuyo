import store from 'app/store';
import { toast } from 'app/lib/toaster';
import { useSettings } from 'app/features/Config/utils/SettingsContext.tsx';
import defaultMachineProfiles from 'app/features/Config/assets/MachineDefaults/defaultMachineProfiles.ts';

import { CatalogModel } from './catalog';

/** Devuelve el id del modelo elegido y la funcion para elegir otro. */
export function useSelectModel() {
    const { machineProfile, setMachineProfile, setProfileChangedSinceDefaults } =
        useSettings();

    const selectModel = (model: CatalogModel) => {
        const profile = defaultMachineProfiles.find(
            (p) => p.id === model.profileId,
        );
        if (!profile) {
            toast.error('No se encontró el perfil de este modelo.', {
                position: 'bottom-right',
            });
            return;
        }
        store.replace('workspace.machineProfile', profile);
        setMachineProfile(profile);
        setProfileChangedSinceDefaults(false);
        toast.success(`Modelo seleccionado: ${model.name}`, {
            position: 'bottom-right',
        });
    };

    return { selectedId: machineProfile?.id as number | undefined, selectModel };
}
