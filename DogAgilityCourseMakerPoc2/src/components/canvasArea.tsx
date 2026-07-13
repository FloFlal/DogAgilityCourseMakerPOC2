import React, { useRef, useEffect } from 'react';
import { State, Layer, Rect, Circle, Transformer } from 'react-konva';
import { useDrawingStore, Shape } from '../store/useDrawingStore';
import Konva from 'konva';

export const CanvasArea: React.FC = () {
    const { shapes, gridSize, selectedId, setSelectedId, addShape, updateShape } = useDrawingStore();
    const transformerRef = useRef<Konva.Transformer>(null);
    const stageRef = useRef<Konva.Stage>(null);

    // Update Konva Transformer when selection changes
    useEffect(() => {
        if(transformerRef.current) {
            const stage = transformerRef.current.getStage();

            if(!stage) return;

            if(selectedId) {
                cosnt selectedNode = stage.findOne('#' + selectedId);

                if(selectedNode) {
                    transformerRef.current.nodes([selectedNode]);
                    transformerRef.current.getLayer().batchDraw();
                    return;
                }
            }

            transformerRef.current.nodes([]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [selectedId, shapes]);

    const handleStageClick = (e: any) => {
        // unselect obstacle when click on background
        if(e.target === e.target.getStage()) {
            if(selectedId) {
                setSelectedId(null);
            } else {
                const pointer = 
            }
        }
    }
}