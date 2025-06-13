import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { ElementPlusResolver as ElementPlusSecondaryResolver } from 'unplugin-vue-components-secondary/resolvers';
export default function createComponents() {

    return Components({
        // dts: true, // enabled by default if `typescript` is installed
        dirs: ['src/components'],
        dts: 'src/components.d.ts',
        resolvers: [ElementPlusSecondaryResolver(), ElementPlusResolver()],
    });


    // // return Components({
    // //     // dts: true, // enabled by default if `typescript` is installed
    // //     dts: 'src/components.d.ts',
    // //     resolvers: [ElementPlusResolver()],
    // // });

    // const primary = Components({
    //     dts: 'src/components.d.ts',
    //     resolvers: [ElementPlusResolver()],
    // });
    // const secondary = ComponentsSecondary({
    //     dts: 'src/components.d.ts',
    //     resolvers: [ElementPlusSecondaryResolver()],
    // });
    // return [primary, secondary];
}
