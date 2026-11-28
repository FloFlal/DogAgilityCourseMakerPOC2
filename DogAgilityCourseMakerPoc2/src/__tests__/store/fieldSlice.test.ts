import { describe, expect, it, beforeEach } from 'vitest';
import { useDrawingStore } from '../../store/useDrawingStore';

// US-033: the field (physical ring) dimensions and the grid cell
// size, both in meters, live in the field slice.

describe('fieldSlice (US-033)', () => {
    beforeEach(() => {
        useDrawingStore.setState({
            fieldWidthMeters: 20,
            fieldLengthMeters: 40,
            cellSizeMeters: 1,
        });
    });

    it('initialise le terrain aux dimensions officielles recommandées (20 m x 40 m)', () => {
        const state = useDrawingStore.getState();

        expect(state.fieldWidthMeters).toBe(20);
        expect(state.fieldLengthMeters).toBe(40);
        expect(state.cellSizeMeters).toBe(1);
    });

    it('redimensionne librement le terrain (pas de limite haute)', () => {
        useDrawingStore.getState().setFieldWidthMeters(60);
        useDrawingStore.getState().setFieldLengthMeters(120);

        const state = useDrawingStore.getState();

        expect(state.fieldWidthMeters).toBe(60);
        expect(state.fieldLengthMeters).toBe(120);
    });

    it('accepte un très petit terrain d\'entraînement (atelier)', () => {
        useDrawingStore.getState().setFieldWidthMeters(2);
        useDrawingStore.getState().setFieldLengthMeters(3);

        const state = useDrawingStore.getState();

        expect(state.fieldWidthMeters).toBe(2);
        expect(state.fieldLengthMeters).toBe(3);
    });

    it('arrondit les dimensions du terrain à un nombre entier de mètres', () => {
        useDrawingStore.getState().setFieldWidthMeters(15.6);

        expect(useDrawingStore.getState().fieldWidthMeters).toBe(16);
    });

    it('ramène les valeurs non valides au plancher de 1 mètre (0, négatif)', () => {
        useDrawingStore.getState().setFieldWidthMeters(0);
        expect(useDrawingStore.getState().fieldWidthMeters).toBe(1);

        useDrawingStore.getState().setFieldLengthMeters(-5);
        expect(useDrawingStore.getState().fieldLengthMeters).toBe(1);
    });

    it('ignore les valeurs non numériques', () => {
        useDrawingStore.getState().setFieldWidthMeters(Number.NaN);
        expect(useDrawingStore.getState().fieldWidthMeters).toBe(20);
    });

    it('fixe la taille de cellule de grille en mètres entiers', () => {
        useDrawingStore.getState().setCellSizeMeters(2);

        expect(useDrawingStore.getState().cellSizeMeters).toBe(2);
    });

    it('arrondit la taille de cellule à un mètre entier et la plancher à 1 m', () => {
        useDrawingStore.getState().setCellSizeMeters(2.4);
        expect(useDrawingStore.getState().cellSizeMeters).toBe(2);

        useDrawingStore.getState().setCellSizeMeters(0);
        expect(useDrawingStore.getState().cellSizeMeters).toBe(1);

        useDrawingStore.getState().setCellSizeMeters(-3);
        expect(useDrawingStore.getState().cellSizeMeters).toBe(1);
    });
});
