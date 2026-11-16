import cn from 'classnames';

import defaultMachineProfiles from 'app/features/Config/assets/MachineDefaults/defaultMachineProfiles.ts';

import { CNCUYO_LINES } from './catalog';
import { MachineSchematic } from './MachineSchematic';
import { useSelectModel } from './useSelectModel';

interface Props {
    /** Tarjetas mas chicas, para usar dentro del asistente de inicio */
    compact?: boolean;
}

/** Grilla de modelos CNC Cuyo, agrupados por linea. Un clic selecciona el modelo. */
export function ModelGrid({ compact = false }: Props) {
    const { selectedId, selectModel } = useSelectModel();

    return (
        <div data-no-translate>
            {CNCUYO_LINES.map((line) => (
                <div key={line.title} className="mb-5 dark:text-white">
                    <h2 className={cn('font-bold', compact ? 'text-base' : 'text-xl')}>
                        {line.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                        {line.description}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {line.models.map((model) => {
                            const profile = defaultMachineProfiles.find(
                                (p) => p.id === model.profileId,
                            );
                            const isSelected = selectedId === model.profileId;

                            return (
                                <button
                                    type="button"
                                    key={model.profileId}
                                    onClick={() => selectModel(model)}
                                    className={cn(
                                        'border rounded-lg p-2 flex flex-col items-center gap-1 text-center bg-white dark:bg-dark dark:border-gray-700 hover:border-blue-400',
                                        isSelected &&
                                            'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-800',
                                    )}
                                >
                                    <div className={compact ? 'h-20 w-20' : 'h-32 w-32'}>
                                        {profile && (
                                            <MachineSchematic
                                                width={profile.mm.width}
                                                depth={profile.mm.depth}
                                            />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'font-bold',
                                            compact ? 'text-sm' : 'text-lg',
                                        )}
                                    >
                                        {model.name}
                                    </span>
                                    {!compact && (
                                        <span className="text-sm text-gray-500 dark:text-gray-300">
                                            {model.summary}
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            'text-xs font-semibold rounded px-2 py-0.5',
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
        </div>
    );
}
