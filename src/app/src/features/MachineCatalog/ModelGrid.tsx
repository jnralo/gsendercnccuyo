import cn from 'classnames';

import { CNCUYO_LINES } from './catalog';
import { useSelectModel } from './useSelectModel';

interface Props {
    /** Sin titulos de linea largos, para usar dentro del asistente de inicio */
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
                            const isSelected = selectedId === model.profileId;

                            return (
                                <button
                                    type="button"
                                    key={model.profileId}
                                    onClick={() => selectModel(model)}
                                    title={model.name}
                                    className={cn(
                                        'relative rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 hover:border-blue-400',
                                        isSelected &&
                                            'border-blue-500 ring-4 ring-blue-300 dark:ring-blue-800',
                                    )}
                                >
                                    <img
                                        src={model.image}
                                        alt={`${model.name}. ${model.summary}`}
                                        className="block w-full aspect-[4/3]"
                                    />
                                    {isSelected && (
                                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold bg-blue-500 text-white rounded px-2 py-0.5 shadow">
                                            Seleccionado
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
