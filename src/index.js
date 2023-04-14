/*
* 解决办法就是首先在 node_modules/cesium 目录下找到它的 package.json 文件，然后修改 exports 字段如下
* "./Source/Widgets/widgets.css": "./Source/Widgets/widgets.css"
*
* */
import 'cesium/Source/Widgets/widgets.css'
import "../src/css/main.css"
import {Ion, Viewer, createWorldTerrain, Cesium3DTileset,ScreenSpaceEventHandler,ScreenSpaceEventType} from "cesium";
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';

const viewer = new Viewer('cesiumContainer', {
    terrainProvider: createWorldTerrain()
});
const  tileset = new Cesium3DTileset({
    url:'http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json',
    maximumScreenSpaceError: 2,        //最大的屏幕空间误差
    maximumNumberOfLoadedTiles: 1000,  //最大加载瓦片个数
})
viewer.scene.primitives.add(
    tileset
);

viewer.zoomTo(tileset)

const screenSpaceEventHandler = new ScreenSpaceEventHandler(viewer.canvas);
screenSpaceEventHandler.setInputAction(function (clickEvent) {
    var pickedObjects = viewer.scene.drillPick(clickEvent.position,5,5,5);
    let feature  = pickedObjects[0];
    let model = feature.content._model;
    if (model && model._sourcePrograms && model._rendererResources) {
        Object.keys(model._sourcePrograms).forEach(key => {
            let program = model._sourcePrograms[key]
            model._rendererResources.sourceShaders[program.vertexShader] =
                `
                precision highp float;
                uniform mat4 u_modelViewMatrix;
                uniform mat4 u_projectionMatrix;
                attribute vec3 a_position;
                attribute vec2 a_texcoord_0;
                varying vec2 v_texcoord_0;
                void main(void) 
                {
                    vec3 weightedPosition = a_position;
                    vec4 position = vec4(weightedPosition, 1.0);
                    position.z = -15.0;
                    position = u_modelViewMatrix * position;
                    gl_Position = u_projectionMatrix * position;
                    v_texcoord_0 = a_texcoord_0;
            }`
        })
        model._shouldRegenerateShaders = true
    }

}, ScreenSpaceEventType.LEFT_CLICK);