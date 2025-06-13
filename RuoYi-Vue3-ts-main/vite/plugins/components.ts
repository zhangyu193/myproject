import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { ElementPlusResolver as ElementPlusSecondaryResolver } from 'unplugin-vue-components-secondary/resolvers';

export default function createComponents() {
    return Components({
        dirs: ['src/components'],
        dts: 'src/components.d.ts',
        resolvers: [ElementPlusSecondaryResolver(), ElementPlusResolver()],
    });
}
