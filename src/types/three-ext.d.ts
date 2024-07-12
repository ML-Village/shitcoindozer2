declare module 'three/examples/jsm/controls/OrbitControls' {
    import { Camera, MOUSE, Object3D, Vector3 } from 'three';
  
    export class OrbitControls {
      constructor(object: Camera, domElement?: HTMLElement);
  
      object: Camera;
      domElement: HTMLElement | Document;
  
      // Rotation
      enabled: boolean;
      enableRotate: boolean;
      rotateSpeed: number;
      
      // Zoom
      enableZoom: boolean;
      zoomSpeed: number;
      
      // Pan
      enablePan: boolean;
      panSpeed: number;
      
      // Other properties...
  
      update(): boolean;
      
      // Other methods...
    }
  }