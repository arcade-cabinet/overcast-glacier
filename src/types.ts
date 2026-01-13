import * as THREE from 'three';

export interface EnemyInstance {
    id: string;
    position: THREE.Vector3;
    hit: () => void;
    type: 'snowman';
}
