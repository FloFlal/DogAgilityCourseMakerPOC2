import { describe, expect, it, beforeEach } from 'vitest';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

const makeObstacle = (id: string): Obstacle => ({
    id,
    type: 'jump',
    x: 0,
    y: 0,
    width: 25,
    height: 25,
    fill: '#3b82f6',
    rotation: 0,
});

describe('useDrawingStore (slices combinées)', () => {
    beforeEach(() => {
        useDrawingStore.setState({
            obstacles: [],
            selectedId: null,
            cellSizeMeters: 1,
            currentColor: '#3b82f6',
            currentShapeType: 'jump',
            importError: null,
        });
    });

    it("addShape utilise les préférences de l'outil sans sélectionner le nouvel obstacle", () => {
        useDrawingStore.setState({ currentColor: '#ff0000', currentShapeType: 'seesaw' });

        useDrawingStore.getState().addShape(10, 20);

        const state = useDrawingStore.getState();

        expect(state.obstacles).toHaveLength(1);
        expect(state.obstacles[0].type).toBe('seesaw');
        expect(state.obstacles[0].fill).toBe('#ff0000');
        expect(state.selectedId).toBeNull();
    });

    it("sélectionner un obstacle désactive l'outil de pose", () => {
        useDrawingStore.setState({ currentShapeType: 'jump' });

        useDrawingStore.getState().setSelectedId('obstacle-1');

        const state = useDrawingStore.getState();
        expect(state.selectedId).toBe('obstacle-1');
        expect(state.currentShapeType).toBeNull();
    });

    it("armer un outil désélectionne l'obstacle courant", () => {
        useDrawingStore.setState({ currentShapeType: null, selectedId: 'obstacle-1' });

        useDrawingStore.getState().setCurrentShapeType('jump');

        const state = useDrawingStore.getState();
        expect(state.currentShapeType).toBe('jump');
        expect(state.selectedId).toBeNull();
    });

    it("updateShape modifie uniquement l'obstacle ciblé", () => {
        useDrawingStore.setState({ obstacles: [makeObstacle('a'), makeObstacle('b')] });

        useDrawingStore.getState().updateShape('a', { x: 99 });

        const [a, b] = useDrawingStore.getState().obstacles;

        expect(a.x).toBe(99);
        expect(b.x).toBe(0);
    });

    it("deleteShape retire l'obstacle et désélectionne si nécessaire", () => {
        useDrawingStore.setState({ obstacles: [makeObstacle('a')], selectedId: 'a' });

        useDrawingStore.getState().deleteShape('a');

        const state = useDrawingStore.getState();

        expect(state.obstacles).toHaveLength(0);
        expect(state.selectedId).toBeNull();
    });

    it('exportToJson / importFromJson font un aller-retour via le service', () => {
        const uuid = '11111111-1111-4111-8111-111111111111';

        useDrawingStore.setState({ obstacles: [makeObstacle(uuid)], selectedId: uuid });

        const json = useDrawingStore.getState().exportToJson();

        useDrawingStore.setState({ obstacles: [], selectedId: null });

        const result = useDrawingStore.getState().importFromJson(json);

        expect(result.success).toBe(true);
        expect(useDrawingStore.getState().obstacles).toEqual([makeObstacle(uuid)]);
        expect(useDrawingStore.getState().selectedId).toBeNull();
    });

    it('importFromJson positionne une erreur sur données invalides', () => {
        const result = useDrawingStore.getState().importFromJson('{oops');

        expect(result.success).toBe(false);
        expect(useDrawingStore.getState().importError).toEqual({ code: 'import.errors.invalidJson' });
    });

    it('setCurrentColor / setCurrentShapeType modifient les préférences', () => {
        useDrawingStore.getState().setCurrentColor('#00ff00');
        useDrawingStore.getState().setCurrentShapeType('aFrame');

        expect(useDrawingStore.getState().currentColor).toBe('#00ff00');
        expect(useDrawingStore.getState().currentShapeType).toBe('aFrame');
    });

    it("addShape n'ajoute rien quand aucun outil n'est actif", () => {
        useDrawingStore.setState({ currentShapeType: null });

        useDrawingStore.getState().addShape(10, 20);

        expect(useDrawingStore.getState().obstacles).toHaveLength(0);
    });

    it("clearImportError réinitialise l'erreur d'import", () => {
        useDrawingStore.setState({ importError: { code: 'import.errors.parseFailed' } });

        useDrawingStore.getState().clearImportError();

        expect(useDrawingStore.getState().importError).toBeNull();
    });

    it('addShape seeds a straight joint chain when placing a tunnel', () => {
        useDrawingStore.setState({ currentShapeType: 'tunnel5m' });

        useDrawingStore.getState().addShape(100, 200);

        const tunnel = useDrawingStore.getState().obstacles[0];

        expect(tunnel.type).toBe('tunnel5m');
        expect(tunnel.width).toBe(66); // outer diameter
        expect(tunnel.height).toBe(500); // regulated length
        expect(tunnel.points).toHaveLength(11); // 10 segments + first joint
        expect(tunnel.points?.[0]).toEqual({ x: 0, y: -250 });
        expect(tunnel.points?.[10]).toEqual({ x: 0, y: 250 });
    });

    it('addShape does not seed points for non-tunnel obstacles', () => {
        useDrawingStore.setState({ currentShapeType: 'jump' });

        useDrawingStore.getState().addShape(100, 200);

        expect(useDrawingStore.getState().obstacles[0].points).toBeUndefined();
    });
});
