import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Transformer } from 'react-konva';
import { useDrawingStore, type Obstacle } from '../store/useDrawingStore';
import Konva from 'konva';
import { UserBadge } from '../obstacles/test';
import { Jump } from '../obstacles/jump';
import { Seesaw } from '../obstacles/seesaw';

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

    return (
        <div className="flew-1 h-screen bg-slate-950 relatvie overflow-hidden">
            {/* Grid on the backgroud, CSS only for lightness */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #ffffff, 1px, transparent 1px)`,
                    backgroundSize: `${gridSize}px ${gridSize}px`
                }} 
            />

            <Stage width={window.innerWidth - 320} // width minus sidebar
                height={window.innerHeight}
                ref={stageRef}
                onClick={handleStageClick}
            >
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
                        } else if (shape.type === 'userBadge') {
                            return <UserBadge {...commonProps} key={shape.id} name="FloFlal" isSelected={false} shapeRef={shapeRef}/>
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
