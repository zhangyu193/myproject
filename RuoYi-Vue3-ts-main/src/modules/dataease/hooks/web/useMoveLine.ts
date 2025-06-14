import { ref, onBeforeUnmount, onMounted } from 'vue'
import { useCache } from '@de/hooks/web/useCache'
import { useEmitt } from '@de/hooks/web/useEmitt'

type Sidebar = 'DATASET' | 'DASHBOARD' | 'DATASOURCE' | 'DATA-FILLING'

export const useMoveLine = (type: Sidebar) => {
  const { wsCache } = useCache('localStorage')
  const width = ref(wsCache.get(type) || 280)
  wsCache.set('current-collapse_bar', width.value)

  const getCoordinates = () => {
    if (document.querySelector('.sidebar-move-line')) {
      document.querySelector('.sidebar-move-line').className = 'sidebar-move-line dragging'
    }
    document.addEventListener('mousemove', setCoordinates)
    document.addEventListener('mouseup', cancelEvent)
    document.querySelector('body').style['user-select'] = 'none'
  }

  const setCollapseBarWidth = () => {
    wsCache.set('current-collapse_bar', width.value)
    useEmitt().emitter.emit('current-collapse_bar')
  }

  const setCoordinates = (e: MouseEvent) => {
    const x = e.clientX
    if (x > 401 || x < 279) {
      width.value = Math.max(Math.min(401, x), 279)
      ele.style.left = width.value - 5 + 'px'
      setCollapseBarWidth()
      return
    }
    ele.style.left = width.value - 5 + 'px'
    width.value = x
    setCollapseBarWidth()
  }

  const cancelEvent = () => {
    if (document.querySelector('.sidebar-move-line')) {
      document.querySelector('.sidebar-move-line').className = 'sidebar-move-line'
    }
    document.querySelector('body').style['user-select'] = 'auto'
    wsCache.set(type, width.value)
    document.removeEventListener('mousemove', setCoordinates)
  }

  const node = ref()

  const ele = document.createElement('div')
  ele.className = 'sidebar-move-line'
  ele.style.top = '0'
  ele.style.left = width.value - 5 + 'px'
  ele.addEventListener('mousedown', getCoordinates)

  onMounted(() => {
    ;(node.value?.$el || node.value)?.appendChild(ele)
  })

  onBeforeUnmount(() => {
    cancelEvent()
    ele.removeEventListener('mousedown', getCoordinates)
    ;(node.value?.$el || node.value)?.removeChild?.(ele)
    width.value = null
  })

  return {
    width,
    node
  }
}
