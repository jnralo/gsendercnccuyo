import { useState } from 'react';
import { useSelector } from 'react-redux';
import isElectron from 'is-electron';

import Page from 'app/components/Page';
import Button from 'app/components/Button';
import { toast } from 'app/lib/toaster';
import controller from 'app/lib/controller';
import { RootState } from 'app/store/redux';

import { DRIVERS, DriverInfo } from './drivers';

export function Drivers() {
    const [busyId, setBusyId] = useState<string | null>(null);
    const ports = useSelector((state: RootState) => state.connection.ports);
    const canInstall = isElectron();

    const installDriver = async (driver: DriverInfo) => {
        setBusyId(driver.id);
        try {
            const result = await (window as any).ipcRenderer.invoke(
                'drivers:install',
                driver.id,
            );
            switch (result?.status) {
                case 'ok':
                    toast.success(
                        'Listo. Desconectá y volvé a conectar el cable USB de la máquina.',
                        { position: 'bottom-right' },
                    );
                    controller.listPorts();
                    break;
                case 'missing':
                    toast.info(
                        'El instalador todavía no está incluido en este programa. Usá el botón "Sitio del fabricante".',
                        { position: 'bottom-right' },
                    );
                    break;
                case 'unsupported':
                    toast.info('La instalación de drivers solo funciona en Windows.', {
                        position: 'bottom-right',
                    });
                    break;
                default:
                    toast.error(
                        `No se pudo instalar el driver. ${result?.message ?? ''}`,
                        { position: 'bottom-right' },
                    );
            }
        } catch (error) {
            toast.error('No se pudo iniciar el instalador.', {
                position: 'bottom-right',
            });
        } finally {
            setBusyId(null);
        }
    };

    const detectedFor = (driver: DriverInfo) =>
        (ports || []).filter((p) =>
            driver.manufacturerHints.some((hint) =>
                (p.manufacturer || '').toLowerCase().includes(hint),
            ),
        );

    return (
        <Page
            title="Drivers"
            description="Instalá el driver USB de la placa de tu máquina si Windows no la reconoce."
            withFixedArea
        >
            <div className="border rounded-lg p-4 mb-4 dark:border-gray-700 dark:text-white">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-bold">Puertos detectados</h2>
                    <Button
                        variant="outline"
                        onClick={() => controller.listPorts()}
                    >
                        Buscar de nuevo
                    </Button>
                </div>
                {ports && ports.length > 0 ? (
                    <ul className="text-sm mt-2 flex flex-col gap-1">
                        {ports.map((p) => (
                            <li key={p.port}>
                                <strong>{p.port}</strong>
                                {p.manufacturer ? ` — ${p.manufacturer}` : ''}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm mt-2 text-gray-500 dark:text-gray-300">
                        No se detecta ninguna máquina. Conectá el cable USB y, si
                        sigue sin aparecer, instalá el driver que corresponda a tu
                        placa.
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
                {DRIVERS.map((driver) => {
                    const detected = detectedFor(driver);
                    return (
                        <div
                            key={driver.id}
                            className="border rounded-lg p-4 flex flex-col gap-2 bg-white dark:bg-dark dark:border-gray-700 dark:text-white"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-lg font-bold">
                                    {driver.name}
                                </h2>
                                {detected.length > 0 && (
                                    <span className="text-xs font-semibold bg-green-500 text-white rounded px-2 py-0.5">
                                        Detectado: {detected[0].port}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                {driver.description}
                            </p>
                            <ul className="text-sm list-disc ml-5">
                                <li>Chip: {driver.chip}</li>
                                <li>Placas: {driver.boards}</li>
                                <li>{driver.usbIds}</li>
                            </ul>
                            <div className="flex gap-2 mt-auto pt-2">
                                {driver.hasInstaller && (
                                    <Button
                                        variant="primary"
                                        disabled={!canInstall || busyId !== null}
                                        onClick={() => installDriver(driver)}
                                    >
                                        {busyId === driver.id
                                            ? 'Instalando...'
                                            : 'Instalar driver'}
                                    </Button>
                                )}
                                <a
                                    href={driver.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center border rounded px-3 py-2 text-sm text-blue-600 dark:text-blue-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Sitio del fabricante
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Page>
    );
}

export default Drivers;
