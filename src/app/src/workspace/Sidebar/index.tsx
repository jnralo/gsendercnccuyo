import cx from 'classnames';

import { NavBar } from 'app/features/navbar';
import { HelperToggle } from 'app/features/Helper/components/HelperToggle.tsx';

import { ModelButton } from './ModelButton';
import { FirstRunWizard } from 'app/features/FirstRunWizard';

export const Sidebar = () => {
    return (
        <div
            className={cx(
                'flex flex-col justify-around box-border transition-width ease-out duration-1000 min-w-14 w-[5%] max-w-[70px] visible max-sm:hidden',
            )}
            aria-label="Main Navigation"
        >
            <div className="border-r-2 border-gray-400 dark:border-gray-700 flex flex-col no-padding no-margin justify-between flex-grow self-stretch">
                <ModelButton />
                <HelperToggle minimized={false} />
            </div>
            <NavBar />
            <FirstRunWizard />
        </div>
    );
};
