import { useNavigate } from 'react-router';
import pubsub from 'pubsub-js';

import Page from 'app/components/Page';
import Button from 'app/components/Button';

import { ModelGrid } from './ModelGrid';

export function MachineCatalog() {
    const navigate = useNavigate();

    return (
        <Page
            title="Modelos de máquina"
            description="Elegí tu modelo de CNC Cuyo."
            withFixedArea
        >
            <ModelGrid />

            <div
                data-no-translate
                className="border rounded-lg p-4 mb-4 dark:border-gray-700 dark:text-white flex items-center justify-between gap-4"
            >
                <p className="text-sm">
                    Los valores internos de la máquina (pasos por mm,
                    velocidades, aceleraciones) se ven y se editan en Config,
                    con la máquina conectada. Desde ahí también se pueden
                    restaurar los valores de fábrica del modelo elegido.
                </p>
                <div className="flex gap-2 shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => pubsub.publish('cncuyo:setup:open')}
                    >
                        Asistente de inicio
                    </Button>
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
