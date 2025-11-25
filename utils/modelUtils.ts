import * as THREE from 'three'

/**
 * Splits a merged mesh into multiple geometries based on proximity to center points.
 * This is useful when multiple objects are combined into a single mesh (e.g. wheels of different cars).
 */
export function splitGeometryByPosition(
    originalMesh: THREE.Mesh,
    centers: Record<string, [number, number, number]>,
    threshold: number = 2.0
): Record<string, THREE.BufferGeometry> {
    const geometry = originalMesh.geometry
    const positionAttribute = geometry.getAttribute('position')
    const indexAttribute = geometry.getIndex()

    if (!indexAttribute) {
        console.warn('splitGeometryByPosition: Geometry is not indexed. This utility currently supports indexed geometries only.')
        return {}
    }

    const result: Record<string, number[]> = {}
    Object.keys(centers).forEach(key => result[key] = [])

    // Helper to get vertex position
    const v = new THREE.Vector3()
    const centerVecs: Record<string, THREE.Vector3> = {}
    Object.entries(centers).forEach(([key, val]) => {
        centerVecs[key] = new THREE.Vector3(...val)
    })

    // Iterate over triangles
    for (let i = 0; i < indexAttribute.count; i += 3) {
        const a = indexAttribute.getX(i)
        const b = indexAttribute.getX(i + 1)
        const c = indexAttribute.getX(i + 2)

        // Get centroid of the triangle
        v.fromBufferAttribute(positionAttribute, a)
        const vB = new THREE.Vector3().fromBufferAttribute(positionAttribute, b)
        const vC = new THREE.Vector3().fromBufferAttribute(positionAttribute, c)

        v.add(vB).add(vC).divideScalar(3)

        // Find closest center
        let closestKey: string | null = null
        let minDist = Infinity

        for (const [key, center] of Object.entries(centerVecs)) {
            const dist = v.distanceTo(center)
            if (dist < threshold && dist < minDist) {
                minDist = dist
                closestKey = key
            }
        }

        if (closestKey) {
            result[closestKey].push(a, b, c)
        }
    }

    // Create new Geometries
    const geometries: Record<string, THREE.BufferGeometry> = {}

    Object.entries(result).forEach(([key, indices]) => {
        if (indices.length === 0) return

        const newGeometry = geometry.clone()
        newGeometry.setIndex(indices)
        // We keep all attributes as is, just change the index. 
        // This is efficient but keeps unused vertices in memory. 
        // For this game, it's negligible.
        geometries[key] = newGeometry
    })

    return geometries
}
