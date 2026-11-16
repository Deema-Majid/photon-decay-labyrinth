import * as THREE from 'three'
import { create } from 'zustand'

/** Meshes that use the shared transmission buffer; hidden while that buffer renders. */
export const transmissive = new Set<THREE.Object3D>()

export function registerTransmissive(obj: THREE.Object3D | null) {
  if (obj) transmissive.add(obj)
}

export function unregisterTransmissive(obj: THREE.Object3D | null) {
  if (obj) transmissive.delete(obj)
}

interface SceneRefs {
  sun: THREE.Mesh | null
  buffer: THREE.Texture | null
  setSun: (m: THREE.Mesh | null) => void
  setBuffer: (t: THREE.Texture | null) => void
}

export const useSceneRefs = create<SceneRefs>((set) => ({
  sun: null,
  buffer: null,
  setSun: (sun) => set({ sun }),
  setBuffer: (buffer) => set({ buffer }),
}))
