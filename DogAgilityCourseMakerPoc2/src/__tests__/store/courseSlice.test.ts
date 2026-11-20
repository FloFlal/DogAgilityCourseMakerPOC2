import { describe, expect, it, beforeEach } from 'vitest';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

const makeObstacle = (id: string, x: number): Obstacle => ({
    id,
    type: 'jump',
    x,
    y: 20,
    width: 25,
    height: 25,
    fill: '#3b82f6',
    rotation: 0,
});

const VALID_OBSTACLE = makeObstacle('11111111-1111-4111-8111-111111111111', 10);

describe('Slice parcours (import/export via le store)', () => {
    beforeEach(() => {
        useDrawingStore.setState({ obstacles: [], selectedId: null, importError: null });
    });

    it('importe les obstacles et réinitialise la sélection', () => {
        useDrawingStore.setState({ selectedId: 'obstacle-courant' });

        const result = useDrawingStore.getState().importFromJson(JSON.stringify([VALID_OBSTACLE]));

        expect(result.success).toBe(true);
        const state = useDrawingStore.getState();
        expect(state.obstacles).toHaveLength(1);
        expect(state.obstacles[0].id).toBe(VALID_OBSTACLE.id);
        expect(state.selectedId).toBeNull();
        expect(state.importError).toBeNull();
    });

    it('enregistre une erreur d\'import en cas de JSON invalide', () => {
        const result = useDrawingStore.getState().importFromJson('not json');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid JSON syntax');
        const state = useDrawingStore.getState();
        expect(state.importError).toBe('Invalid JSON syntax');
        expect(state.obstacles).toHaveLength(0);
    });

    it('exporte les obstacles courants en JSON', () => {
        useDrawingStore.setState({ obstacles: [VALID_OBSTACLE] });

        const json = useDrawingStore.getState().exportToJson();

        expect(JSON.parse(json)).toHaveLength(1);
        expect(JSON.parse(json)[0].id).toBe(VALID_OBSTACLE.id);
    });

    it('efface l\'erreur d\'import courante', () => {
        useDrawingStore.setState({ importError: 'Invalid JSON syntax' });

        useDrawingStore.getState().clearImportError();

        expect(useDrawingStore.getState().importError).toBeNull();
    });

    it('supprime un obstacle non sélectionné sans perdre la sélection', () => {
        const first = makeObstacle('obstacle-1', 0);
        const second = makeObstacle('obstacle-2', 100);
        useDrawingStore.setState({ obstacles: [first, second], selectedId: 'obstacle-1' });

        useDrawingStore.getState().deleteShape('obstacle-2');

        const state = useDrawingStore.getState();
        expect(state.obstacles).toHaveLength(1);
        expect(state.selectedId).toBe('obstacle-1');
    });
});
