import { createStyleImportPlugin, ElementPlusSecondaryResolve } from 'vite-plugin-style-import-secondary';

export default function createStyleImportSecondary() {
    return createStyleImportPlugin({
        resolves: [ElementPlusSecondaryResolve()],
        libs: [
            {
                libraryName: 'element-plus-secondary',
                esModule: true,
                resolveStyle: name => `element-plus-secondary/es/components/${name.substring(3)}/style/css`,
            },
        ],
    });
}