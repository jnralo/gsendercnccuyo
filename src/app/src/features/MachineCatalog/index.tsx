import { useNavigate } from 'react-router';
import cn from 'classnames';

import Page from 'app/components/Page';
import Button from 'app/components/Button';
import store from 'app/store';
import { toast } from 'app/lib/toaster';
import { useSettings } from 'app/features/Config/utils/SettingsContext.tsx';
import defaultMachineProfiles from 'app/features/Config/assets/MachineDefaults/defaultMachineProfiles.ts';

import { CNCUYO_MODELS, CatalogModel } from './catalog';
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
            description="Elegí tu modelo de CNC Cuyo y el programa carga sus medidas y ajustes."
            withFixedArea
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">
                {CNCUYO_MODELS.map((model) => {
                    const profile = defaultMachineProfiles.find(
                        (p) => p.id === model.profileId,
                    );
                    const isSelected = machineProfile?.id === model.profileId;

                    return (
                        <div
                            key={model.profileId}
                            className={cn(
                                'border rounded-lg p-4 flex flex-col gap-3 bg-white dark:bg-dark dark:border-gray-700 dark:text-white',
                                isSelected &&
                                    'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-800',
                            )}
                        >
                            <div className="h-40 flex items-center justify-center">
                                {profile && (
                                    <MachineSchematic
                                        width={profile.mm.width}
                                        depth={profile.mm.depth}
                                    />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <h2 className="text-xl font-bold">
                                        {model.name}
                                    </h2>
                                    {isSelected && (
                                        <span className="text-xs font-semibold bg-blue-500 text-white rounded px-2 py-0.5">
                                            Seleccionado
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    {model.summary}
                                </p>
                            </div>

                            {model.specs.length > 0 && (
                                <ul className="text-sm list-disc ml-5 flex flex-col gap-1">
                                    {model.specs.map((spec) => (
                                        <li key={spec}>{spec}</li>
                                    ))}
                                </ul>
                            )}

                            {model.pending && (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    {model.pending}
                                </p>
                            )}

                            <Button
                                variant={isSelected ? 'outline' : 'primary'}
                                className="mt-auto"
                                onClick={() => selectModel(model)}
                            >
                                {isSelected
                                    ? 'Modelo seleccionado'
                                    : 'Seleccionar este modelo'}
                            </Button>
                        </div>
                    );
                })}
            </div>

            <div className="border rounded-lg p-4 mb-4 dark:border-gray-700 dark:text-white flex items-center justify-between gap-4">
                <p className="text-sm">
                    Para enviar los ajustes del modelo a la máquina: conectala y
                    en Config usá <strong>Restaurar valores por defecto</strong>.
                    Solo se envían los valores confirmados de ese modelo.
                </p>
                <Button
                    variant="outline"
                    onClick={() => navigate('/configuration')}
                >
                    Ir a Config
                </Button>
            </div>
        </Page>
    );
}

export default MachineCatalog;
