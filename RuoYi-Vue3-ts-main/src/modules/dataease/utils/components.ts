import VText from '@de/custom-component/v-text/Component.vue'
import VQuery from '@de/custom-component/v-query/Component.vue'
import VTextAttr from '@de/custom-component/v-text/Attr.vue'
import Group from '@de/custom-component/group/Component.vue'
import GroupAttr from '@de/custom-component/group/Attr.vue'
import UserView from '@de/custom-component/user-view/Component.vue'
import UserViewAttr from '@de/custom-component/user-view/Attr.vue'
import Picture from '@de/custom-component/picture/Component.vue'
import PictureAttr from '@de/custom-component/picture/Attr.vue'
import CanvasBoard from '@de/custom-component/canvas-board/Component.vue'
import CanvasBoardAttr from '@de/custom-component/canvas-board/Attr.vue'
import CanvasIcon from '@de/custom-component/canvas-icon/Component.vue'
import CanvasIconAttr from '@de/custom-component/canvas-icon/Attr.vue'
import DeTabs from '@de/custom-component/de-tabs/Component.vue'
import DeTabsAttr from '@de/custom-component/de-tabs/Attr.vue'
import DeGraphical from '@de/custom-component/de-graphical/Component.vue'
import DeGraphicalAttr from '@de/custom-component/de-graphical/Attr.vue'
import CircleShape from '@de/custom-component/circle-shape/Component.vue'
import CircleShapeAttr from '@de/custom-component/circle-shape/Attr.vue'
import RectShape from '@de/custom-component/rect-shape/Component.vue'
import RectShapeAttr from '@de/custom-component/rect-shape/Attr.vue'
import SvgTriangle from '@de/custom-component/svgs/svg-triangle/Component.vue'
import SvgTriangleAttr from '@de/custom-component/svgs/svg-triangle/Attr.vue'
import DeTimeClock from '@de/custom-component/de-time-clock/Component.vue'
import DeTimeClockAttr from '@de/custom-component/de-time-clock/Attr.vue'
import GroupArea from '@de/custom-component/group-area/Component.vue'
import GroupAreaAttr from '@de/custom-component/group-area/Attr.vue'
import DeFrame from '@de/custom-component/de-frame/ComponentFrame.vue'
import DeFrameAttr from '@de/custom-component/de-frame/Attr.vue'
import DeVideo from '@de/custom-component/de-video/Component.vue'
import DeVideoAttr from '@de/custom-component/de-video/Attr.vue'
import DeStreamMedia from '@de/custom-component/de-stream-media/Component.vue'
import DeStreamMediaAttr from '@de/custom-component/de-stream-media/Attr.vue'
import ScrollText from '@de/custom-component/scroll-text/Component.vue'
import ScrollTextAttr from '@de/custom-component/scroll-text/Attr.vue'
import PopArea from '@de/custom-component/pop-area/Component.vue'
import PopAreaAttr from '@de/custom-component/pop-area/Attr.vue'
import PictureGroup from '@de/custom-component/picture-group/Component.vue'
import PictureGroupAttr from '@de/custom-component/picture-group/Attr.vue'
export const componentsMap = {
  VText: VText,
  VQuery,
  VTextAttr: VTextAttr,
  Group: Group,
  GroupAttr: GroupAttr,
  UserView: UserView,
  UserViewAttr: UserViewAttr,
  Picture: Picture,
  PictureAttr: PictureAttr,
  CanvasBoard: CanvasBoard,
  CanvasBoardAttr: CanvasBoardAttr,
  CanvasIcon: CanvasIcon,
  CanvasIconAttr: CanvasIconAttr,
  DeTabs: DeTabs,
  DeTabsAttr: DeTabsAttr,
  DeGraphical: DeGraphical,
  DeGraphicalAttr: DeGraphicalAttr,
  CircleShape: CircleShape,
  CircleShapeAttr: CircleShapeAttr,
  RectShape: RectShape,
  RectShapeAttr: RectShapeAttr,
  SvgTriangle: SvgTriangle,
  SvgTriangleAttr: SvgTriangleAttr,
  DeTimeClock: DeTimeClock,
  DeTimeClockAttr: DeTimeClockAttr,
  GroupArea: GroupArea,
  GroupAreaAttr: GroupAreaAttr,
  DeFrame: DeFrame,
  DeFrameAttr: DeFrameAttr,
  DeVideo: DeVideo,
  DeVideoAttr: DeVideoAttr,
  DeStreamMedia: DeStreamMedia,
  DeStreamMediaAttr: DeStreamMediaAttr,
  ScrollText: ScrollText,
  ScrollTextAttr: ScrollTextAttr,
  PopArea: PopArea,
  PopAreaAttr: PopAreaAttr,
  PictureGroup: PictureGroup,
  PictureGroupAttr: PictureGroupAttr
}

export default function findComponent(key) {
  return componentsMap[key]
}

export function findComponentAttr(component) {
  const key =
    component.component === 'UserView' && component.innerType === 'picture-group'
      ? 'PictureGroupAttr'
      : component.component + 'Attr'
  return componentsMap[key]
}
