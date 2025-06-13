import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { ElementPlusResolver as ElementPlusSecondaryResolver } from 'unplugin-vue-components-secondary/resolvers';
export default function createAutoImport() {
    return AutoImport({
        resolvers: [ElementPlusResolver(), ElementPlusSecondaryResolver()],
    });
}
