import { useNavigate } from 'react-router';
import cn from 'classnames';

import Page from 'app/components/Page';
import Button from 'app/components/Button';
import store from 'app/store';
import { toast } from 'app/lib/toaster';
import { useSettings } from 'app/features/Config/utils/SettingsContext.tsx';
import defaultMachineProfiles from 'app/features/Config/assets/MachineDefaults/defaultMachineProfiles.ts';

import { CNCUYO_LINES, CatalogModel } from './catalog';
import { MachineSchematic } from './MachineSchematic';

export function MachineCatalog() {
    const navigate = useNavigate();
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

    return (
        <Page
            title="Modelos de máquina"
            description="Elegí tu modelo de CNC Cuyo."
            withFixedArea
        >
            <div data-no-translate>
                {CNCUYO_LINES.map((line) => (
                    <div key={line.title} className="mb-6 dark:text-white">
                        <h2 className="text-xl font-bold">{line.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">
                            {line.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {line.models.map((model) => {
                                const profile = defaultMachineProfiles.find(
                                    (p) => p.id === model.profileId,
                                );
                                const isSelected =
                                    machineProfile?.id === model.profileId;

                                return (
                                    <button
                                        type="button"
                                        key={model.profileId}
                                        onClick={() => selectModel(model)}
                                        className={cn(
                                            'border rounded-lg p-3 flex flex-col items-center gap-1 text-center bg-white dark:bg-dark dark:border-gray-700 hover:border-blue-400',
                                            isSelected &&
                                                'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-800',
                                        )}
                                    >
                                        <div className="h-32 w-32">
                                            {profile && (
                                                <MachineSchematic
                                                    width={profile.mm.width}
                                                    depth={profile.mm.depth}
                                                />
                                            )}
                                        </div>
                                        <span className="text-lg font-bold">
                                            {model.name}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-300">
                                            {model.summary}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-xs font-semibold rounded px-2 py-0.5 mt-1',
                                                isSelected
                                                    ? 'bg-blue-500 text-white'
                                                    : 'invisible',
                                            )}
                                        >
                                            Seleccionado
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="border rounded-lg p-4 mb-4 dark:border-gray-700 dark:text-white flex items-center justify-between gap-4">
                    <p className="text-sm">
                        Los valores internos de la máquina (pasos por mm,
                        velocidades, aceleraciones) se ven y se editan en
                        Config, con la máquina conectada. Desde ahí también se
                        pueden restaurar los valores de fábrica del modelo
                        elegido.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/configuration')}
                    >
                        Editar valores
                    </Button>
                </div>
            </div>
        </Page>
    );
}

export default MachineCatalog;
