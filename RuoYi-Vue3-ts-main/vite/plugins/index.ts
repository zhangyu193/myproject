import vue from '@vitejs/plugin-vue';

import createAutoImport from './auto-import';
import createComponents from "./components";
import createStyleImportSecondary from './style-import-secondary';
import createSvgIcon from './svg-icon';
import createSvgLoader from './svg- loader';
import createCompression from './compression';
import createSetupExtend from './setup-extend';
import { PluginOption } from 'vite';

export default function createVitePlugins(viteEnv: Record<string, string>, isBuild = false) {
    const vitePlugins: PluginOption[] = [vue()];
    vitePlugins.push(createAutoImport());
    //vitePlugins.push(createComponents());
    const comps = createComponents();
    if (Array.isArray(comps)) {
        vitePlugins.push(...comps);
    } else {
        vitePlugins.push(comps);
    }
    vitePlugins.push(createSetupExtend());
    vitePlugins.push(createStyleImportSecondary());
    vitePlugins.push(createSvgLoader());
    vitePlugins.push(createSvgIcon(isBuild));
    isBuild && vitePlugins.push(...createCompression(viteEnv));
    return vitePlugins;
}
