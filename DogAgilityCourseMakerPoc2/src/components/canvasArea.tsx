import React, { useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Transformer, Line } from 'react-konva';
import { useDrawingStore, type Obstacle } from '../store/useDrawingStore';
import Konva from 'konva';
import { UserBadge } from '../obstacles/test';
import { Jump } from '../obstacles/jump';
import { Seesaw } from '../obstacles/seesaw';
import { DogWalk } from '../obstacles/dogWalk';
import { AFrame } from '../obstacles/aFrame';

export const CanvasArea: React.FC = () => {
    const { obstacles: shapes, gridSize, selectedId, setSelectedId, addShape, updateShape } = useDrawingStore();
    const transformerRef = useRef<Konva.Transformer>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const shapeRef = useRef<Konva.Shape>(null);

    // Update Konva Transformer when selection changes
    useEffect(() => {
        if(transformerRef.current) {
            const stage = transformerRef.current.getStage();

            if(!stage) return;

            if(selectedId) {
                const selectedNode = stage.findOne('#' + selectedId);

                if(selectedNode) {
                    transformerRef.current.nodes([selectedNode]);
                    transformerRef.current.getLayer()?.batchDraw();
                    return;
                }
            }

            transformerRef.current.nodes([]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [selectedId, shapes]);

    const handleStageClick = (e: any) => {
        // unselect obstacle when click on background
        if(e.target === e.target.getStage()) {
            if(selectedId) {
                setSelectedId(null);
            } else {
                const pointer = stageRef.current?.getPointerPosition();
                if(pointer) {
                    addShape(pointer.x, pointer.y);
                }
            }
        }
    };

    // Create grid lines
    const gridWidth = window.innerWidth - 320;
    const gridHeight = window.innerHeight;
    
    const gridLines = useMemo(() => {
        const lines = [];
        
        // Vertical lines
        for (let x = 0; x <= gridWidth; x += gridSize) {
            lines.push(
                <Line
                    key={`v-${x}`}
                    x={x}
                    y={0}
                    points={[0, 0, 0, gridHeight]}
                    stroke="#000"
                    strokeWidth={1}
                    opacity={0.1}
                    listening={false}
                />
            );
        }
        
        // Horizontal lines
        for (let y = 0; y <= gridHeight; y += gridSize) {
            lines.push(
                <Line
                    key={`h-${y}`}
                    x={0}
                    y={y}
                    points={[0, 0, gridWidth, 0]}
                    stroke="#000"
                    strokeWidth={1}
                    opacity={0.1}
                    listening={false}
                />
            );
        }
        
        return lines;
    }, [gridSize, gridWidth, gridHeight]);

    return (
        <div className="flew-1 h-screen bg-slate-950 relatvie overflow-hidden">
            <Stage width={gridWidth} // width minus sidebar
                height={gridHeight}
                ref={stageRef}
                onClick={handleStageClick}
            >
                {/* Grid layer - limited to drawing area */}
                <Layer>
                    {gridLines}
                </Layer>
                
                <Layer>
                    {shapes.map((shape: Obstacle) => {
                        const isSlected = shape.id === selectedId;
                        
                        const commonProps = {
                            ratio: 2.5,
                            id: shape.id,
                            x: shape.x,
                            y: shape.y,
                            fill: shape.fill,
                            rotation: shape.rotation,
                            draggable: true,
                            isSlected: isSlected,
                            primaryColor: "#FFFF00",
                            secondaryColor: "#aaa",
                            onClick: (e: any) => {
                                e.cancelBubble = true; // avoid click on Stage
                                setSelectedId(shape.id);
                            },
                            onDragEnd: (e: any) => {
                                updateShape(shape.id, {
                                    x: e.target.x(),
                                    y: e.target.y()
                                });
                            },
                            onDrag: (e: any) => {
                                if (!isSlected) {
                                    setSelectedId(shape.id);
                                }
                            },
                            onTransformEnd: (e: any) => {
                                // handle the end of rotation
                                const node = e.target;
                                updateShape(shape.id, {
                                    x: node.x(),
                                    y: node.y(),
                                    rotation: node.rotation(),
                                })
                            }
                        };
                        
                        if (shape.type === 'jump') {
                            return <Jump {...commonProps} key={shape.id} barWidth={130} barThickess={5}  hurdleWidth={50} hurdleDepth={40} hurdleThickness={10} />
                        } else if (shape.type === 'seesaw') {
                            return <Seesaw {...commonProps} key={shape.id} width={30} length={370} zoneLength={90}/>
                        } else if (shape.type === 'dogWalk') {
                            return <DogWalk {...commonProps} key={shape.id} width={30} elementLength={370} zoneLength={90}/>
                        } else if (shape.type === 'aFrame') {
                            return <AFrame {...commonProps} key={shape.id} width={90} elementLength={270} zoneLength={106}/>
                        } 
                    })}

                    {/*The component that surround the obstacle*/}
                    <Transformer ref={transformerRef} boundBoxFunc={(oldBox, newBox) => {
                            if(newBox.width < 10 || newBox.height < 10) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                        rotateEnabled={true}
                        borderStroke='red'
                        anchorCornerRadius={5}
                        enabledAnchors={[]}
                    />
                </Layer>
            </Stage>
        </div>
    );
};
