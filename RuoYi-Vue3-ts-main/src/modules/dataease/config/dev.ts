export default {
  server: {
    proxy: {
      '/api/f': {
        target: 'http://192.168.0.168:18081',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/f/, '')
      },
      // 使用 proxy 实例
      '/api': {
        target: 'http://192.168.0.168:18081',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, 'de2api')
      }
    },
    port: 8081
  }
}
