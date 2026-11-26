import { Widget } from '../../components/Widget';
import { Tabs } from '../../components/Tabs';
import Console from '../Console';
import Probe from '../Probe';
import Spindle from '../Spindle';
import Coolant from '../Coolant';
import Rotary from '../Rotary';
import Macros from '../Macros';
import { useWidgetState } from 'app/hooks/useWidgetState';
import { useWorkspaceState } from 'app/hooks/useWorkspaceState';
import { ATCWidget } from 'app/features/ATC';
import { useTypedSelector } from 'app/hooks/useTypedSelector.ts';
import { RootState } from 'app/store/redux';
import { useSimpleMode } from 'app/hooks/useSimpleMode';

// Pestanas que se ocultan en la vista simple
const SIMPLE_MODE_HIDDEN_TABS = ['Probe', 'Macros', 'ATC', 'Coolant', 'Rotary', 'Console'];

export interface TabItem {
    label: string;
    content: React.ComponentType<{ isActive: boolean }>;
}

const tabs = [
    {
        label: 'Probe',
        content: Probe,
    },
    {
        label: 'Macros',
        content: Macros,
    },
    {
        label: 'Spindle/Laser',
        content: Spindle,
    },
    {
        label: 'ATC',
        content: ATCWidget,
    },
    {
        label: 'Coolant',
        content: Coolant,
    },
    {
        label: 'Rotary',
        content: Rotary,
    },
    {
        label: 'Console',
        content: Console,
    },
];

const Tools = () => {
    const rotary = useWidgetState('rotary');
    const { spindleFunctions, coolantFunctions, atcEnabled } =
        useWorkspaceState();
    const simpleMode = useSimpleMode();
    const atcReport = useTypedSelector(
        (state: RootState) => state.controller.settings.info?.NEWOPT?.ATC,
    );

    const atcEnabledOrCompiled = atcEnabled || atcReport === '1';

    const filteredTabs = tabs.filter((tab) => {
        if (simpleMode && SIMPLE_MODE_HIDDEN_TABS.includes(tab.label)) {
            return false;
        }

        if (tab.label === 'Rotary' && !rotary.tab.show) {
            return false;
        }

        if (tab.label === 'Spindle/Laser' && !spindleFunctions) {
            return false;
        }
        if (tab.label === 'ATC' && !atcEnabledOrCompiled) {
            return false;
        }

        if (tab.label === 'Coolant' && !coolantFunctions) {
            return false;
        }

        return true;
    });

    // En vista simple pueden quedar todas las pestanas ocultas
    if (filteredTabs.length === 0) {
        return (
            <Widget data-tour="tools-panel">
                <Widget.Content>
                    <div
                        className="h-full flex items-center justify-center p-4 text-center text-sm text-gray-500 dark:text-gray-400"
                        data-no-translate
                    >
                        Vista simple: las herramientas avanzadas están ocultas.
                        Para verlas, tocá "Simple" en la barra de arriba.
                    </div>
                </Widget.Content>
            </Widget>
        );
    }

    return (
        <Widget data-tour="tools-panel">
            <Widget.Content>
                <Tabs items={filteredTabs as TabItem[]} />
            </Widget.Content>
        </Widget>
    );
};

export default Tools;
