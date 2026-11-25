import { useEffect, useState } from 'react';
import cx from 'classnames';
import { GiSpinningBlades } from 'react-icons/gi';

import controller from 'app/lib/controller';
import { useTypedSelector } from 'app/hooks/useTypedSelector';
import { RootState } from 'app/store/redux';
import {
    GRBL_ACTIVE_STATE_HOLD,
    GRBL_ACTIVE_STATE_IDLE,
    WORKFLOW_STATE_RUNNING,
} from 'app/constants';

/**
 * Encendido/apagado de la fresadora (husillo) con un solo boton.
 * Las maquinas CNC Cuyo encienden la fresadora con un rele, asi que alcanza con
 * M3 (encender) y M5 (apagar). Se envia M3 con la velocidad maxima ($30) porque en
 * GRBL con husillo de velocidad variable S0 dejaria la salida apagada.
 */
export function SpindleToggle() {
    const isConnected = useTypedSelector(
        (state: RootState) => state.connection.isConnected,
    );
    const activeState = useTypedSelector(
        (state: RootState) => state.controller.state.status?.activeState,
    );
    const workflowState = useTypedSelector(
        (state: RootState) => state.controller.workflow.state,
    );
    const spindleModal = useTypedSelector(
        (state: RootState) => state.controller.modal.spindle ?? 'M5',
    );
    const spindleMax = useTypedSelector((state: RootState) =>
        Number(state.controller.settings.settings?.$30 ?? 1000),
    );

    const [isOn, setIsOn] = useState(spindleModal !== 'M5');
    useEffect(() => {
        setIsOn(spindleModal !== 'M5');
    }, [spindleModal]);

    // Durante un trabajo la fresadora la maneja el archivo (M3/M5)
    const canUse =
        isConnected &&
        workflowState !== WORKFLOW_STATE_RUNNING &&
        (activeState === GRBL_ACTIVE_STATE_IDLE ||
            activeState === GRBL_ACTIVE_STATE_HOLD);

    const toggle = () => {
        if (!canUse) {
            return;
        }
        if (isOn) {
            controller.command('gcode', 'M5');
            setIsOn(false);
        } else {
            controller.command('gcode', `M3 S${spindleMax || 1000}`);
            setIsOn(true);
        }
    };

    return (
        <div
            className="flex justify-center items-center"
            data-tour="spindle"
            data-no-translate
        >
            <button
                type="button"
                title={
                    isOn
                        ? 'Apagar la fresadora (M5)'
                        : 'Encender la fresadora (M3)'
                }
                className={cx(
                    'flex flex-col items-center justify-center leading-tight portrait:h-14 h-12 max-xl:h-11 w-[6.5rem] max-xl:w-24 portrait:w-28 px-2 text-sm rounded border-solid border-gray-600 duration-150 ease-in-out',
                    '[box-shadow:_0.4px_0.4px_2px_2px_var(--tw-shadow-color)] shadow-gray-500',
                    {
                        'bg-gray-300 text-gray-600 dark:bg-dark dark:text-gray-400 cursor-not-allowed':
                            !canUse,
                        'bg-sky-600 dark:bg-sky-700 text-white':
                            canUse && !isOn,
                        'bg-amber-500 dark:bg-amber-600 text-white':
                            canUse && isOn,
                    },
                )}
                onClick={toggle}
                disabled={!canUse}
            >
                <span className="flex items-center gap-1 font-semibold">
                    <GiSpinningBlades
                        className={cx('w-4 h-4', { 'animate-spin': isOn })}
                    />
                    Fresadora
                </span>
                <span className="text-xs">
                    {isOn ? 'Encendida' : 'Apagada'}
                </span>
            </button>
        </div>
    );
}
