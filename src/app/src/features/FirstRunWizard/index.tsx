import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import pubsub from 'pubsub-js';

import store from 'app/store';
import controller from 'app/lib/controller';
import Button from 'app/components/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from 'app/components/shadcn/Dialog';
import { RootState } from 'app/store/redux';
import { ModelGrid } from 'app/features/MachineCatalog/ModelGrid';
import { useSelectModel } from 'app/features/MachineCatalog/useSelectModel';
import { findMachinePort } from 'app/features/Drivers/drivers';

const DONE_KEY = 'workspace.cncuyoSetupDone';

const STEPS = ['Modelo', 'Driver', 'Conectar', 'Probar'];

// Movimientos cortos de prueba ($J = jog de GRBL, en milimetros y relativo).
const TEST_MOVES = [
    { label: 'X +10 mm', command: '$J=G91 G21 X10 F800' },
    { label: 'X -10 mm', command: '$J=G91 G21 X-10 F800' },
    { label: 'Y +10 mm', command: '$J=G91 G21 Y10 F800' },
    { label: 'Y -10 mm', command: '$J=G91 G21 Y-10 F800' },
    { label: 'Z +5 mm (sube)', command: '$J=G91 G21 Z5 F300' },
    { label: 'Z -5 mm (baja)', command: '$J=G91 G21 Z-5 F300' },
];

/**
 * Asistente de primer uso: elegir modelo, revisar driver, conectar y probar.
 * Se abre solo la primera vez y se puede reabrir desde la pantalla de modelos.
 */
export function FirstRunWizard() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const { selectedId } = useSelectModel();

    const ports = useSelector((state: RootState) => state.connection.ports);
    const isConnected = useSelector(
        (state: RootState) => state.connection.isConnected,
    );
    const machinePort = findMachinePort(ports || []);

    useEffect(() => {
        if (!store.get(DONE_KEY, false)) {
            setOpen(true);
        }
        const token = pubsub.subscribe('cncuyo:setup:open', () => {
            setStep(0);
            setOpen(true);
        });
        return () => {
            pubsub.unsubscribe(token);
        };
    }, []);

    useEffect(() => {
        if (open && step === 1) {
            controller.listPorts();
        }
    }, [open, step]);

    const finish = () => {
        store.set(DONE_KEY, true);
        setOpen(false);
    };

    const connect = () => {
        if (!machinePort) {
            return;
        }
        store.set('widgets.connection.port', machinePort.port);
        pubsub.publish('reconnect');
    };

    const modelChosen = selectedId !== undefined && selectedId >= 200;

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) {
                    finish();
                }
            }}
        >
            <DialogContent
                className="max-w-3xl bg-white dark:bg-dark dark:text-white"
                data-no-translate
            >
                <DialogHeader>
                    <DialogTitle>Primeros pasos con tu CNC Cuyo</DialogTitle>
                    <DialogDescription>
                        Paso {step + 1} de {STEPS.length}: {STEPS[step]}
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-[300px] max-h-[60vh] overflow-y-auto">
                    {step === 0 && (
                        <div>
                            <p className="text-sm mb-3">
                                Elegí el modelo de tu máquina. Lo podés cambiar
                                después desde el ícono "Modelo".
                            </p>
                            <ModelGrid compact />
                        </div>
                    )}

                    {step === 1 && (
                        <div className="flex flex-col gap-3 text-sm">
                            <p>
                                Conectá la máquina a la computadora con el cable
                                USB y encendela.
                            </p>
                            {machinePort ? (
                                <p className="font-semibold text-green-600">
                                    Máquina detectada en {machinePort.port}
                                    {machinePort.manufacturer
                                        ? ` (${machinePort.manufacturer})`
                                        : ''}
                                    . El driver ya está instalado.
                                </p>
                            ) : (
                                <>
                                    <p className="font-semibold text-amber-600">
                                        Todavía no se detecta la máquina.
                                    </p>
                                    <p>
                                        Si el cable está conectado y sigue sin
                                        aparecer, falta el driver USB de la
                                        placa.
                                    </p>
                                </>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => controller.listPorts()}
                                >
                                    Buscar de nuevo
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setOpen(false);
                                        navigate('/drivers');
                                    }}
                                >
                                    Ir a Drivers
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-3 text-sm">
                            {isConnected ? (
                                <p className="font-semibold text-green-600">
                                    Máquina conectada.
                                </p>
                            ) : machinePort ? (
                                <>
                                    <p>
                                        Se va a conectar a la máquina en{' '}
                                        <strong>{machinePort.port}</strong>.
                                    </p>
                                    <div>
                                        <Button variant="primary" onClick={connect}>
                                            Conectar
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <p>
                                    No se detecta la máquina. Volvé al paso
                                    anterior, o cerrá este asistente y conectá
                                    desde el botón "Conectar al CNC" de arriba a
                                    la izquierda, eligiendo el puerto a mano.
                                </p>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col gap-3 text-sm">
                            <p>
                                Probá que cada eje se mueva. Antes, fijate que
                                la fresa tenga lugar libre para moverse hacia
                                todos lados.
                            </p>
                            {!isConnected && (
                                <p className="font-semibold text-amber-600">
                                    Conectá la máquina para poder probar.
                                </p>
                            )}
                            <div className="grid grid-cols-2 gap-2 max-w-md">
                                {TEST_MOVES.map((move) => (
                                    <Button
                                        key={move.label}
                                        variant="outline"
                                        disabled={!isConnected}
                                        onClick={() =>
                                            controller.command('gcode', [
                                                move.command,
                                            ])
                                        }
                                    >
                                        {move.label}
                                    </Button>
                                ))}
                            </div>
                            <p>
                                Si algún eje se mueve al revés o no se mueve,
                                escribinos antes de hacer un trabajo.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between gap-2">
                    <Button variant="ghost" onClick={finish}>
                        Omitir
                    </Button>
                    <div className="flex gap-2">
                        {step > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setStep(step - 1)}
                            >
                                Atrás
                            </Button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <Button
                                variant="primary"
                                disabled={step === 0 && !modelChosen}
                                onClick={() => setStep(step + 1)}
                            >
                                Siguiente
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={finish}>
                                Terminar
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
