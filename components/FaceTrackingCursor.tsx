import React, { useState, useEffect, useRef } from 'react';

declare const JEELIZFACEFILTER: any;

const SENSITIVITY = 1.5; // Adjust for more/less cursor movement
const MOUTH_OPEN_THRESHOLD = 0.6; // Adjust for click sensitivity
const CLICK_DEBOUNCE = 300; // ms to wait before allowing another click

const FaceTrackingCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const mouthWasOpen = useRef(false);
    const lastClickTime = useRef(0);

    useEffect(() => {
        let isComponentMounted = true;

        JEELIZFACEFILTER.init({
            canvasId: 'jeelizFaceFilterCanvas',
            NNCPath: 'https://appstatic.jeeliz.com/faceFilter/NNC.json',
            videoSettings: {
                facingMode: 'user' // front camera
            },
            callbackReady: (errCode: any) => {
                if (errCode || !isComponentMounted) {
                    console.error('JEELIZFACEFILTER.init failed:', errCode);
                    return;
                }
                console.log('JeelizFaceFilter initialized successfully.');
                JEELIZFACEFILTER.toggle_pause(false, true);
            },
            callbackTrack: (detectState: any) => {
                // ----- CURSOR MOVEMENT -----
                const pitch = detectState.rx; // Nodding up/down
                const yaw = detectState.ry;   // Shaking left/right

                // Map rotation to screen coordinates
                const dx = -yaw * SENSITIVITY * window.innerWidth / 2;
                const dy = pitch * SENSITIVITY * window.innerHeight / 2;

                setPosition({
                    x: (window.innerWidth / 2) + dx,
                    y: (window.innerHeight / 2) + dy,
                });


                // ----- CLICK ACTION -----
                const mouthOpen = detectState.expressions[0];
                const now = Date.now();

                if (mouthOpen > MOUTH_OPEN_THRESHOLD && !mouthWasOpen.current && (now - lastClickTime.current > CLICK_DEBOUNCE)) {
                    // Mouth just opened and debounce period has passed
                    const elementUnderCursor = document.elementFromPoint(position.x, position.y);

                    if (elementUnderCursor && typeof (elementUnderCursor as HTMLElement).click === 'function') {
                        (elementUnderCursor as HTMLElement).click();
                    }
                    
                    lastClickTime.current = now;
                }

                // Update the state for the next frame
                mouthWasOpen.current = mouthOpen > MOUTH_OPEN_THRESHOLD;
            }
        });

        return () => {
            isComponentMounted = false;
            // Cleanup: stop JeelizFaceFilter when component unmounts
            try {
                if (JEELIZFACEFILTER.is_detected()) {
                    JEELIZFACEFILTER.toggle_pause(true, true);
                    const stream = JEELIZFACEFILTER.get_stream();
                    if (stream) {
                        stream.getTracks().forEach((track: any) => track.stop());
                    }
                    JEELIZFACEFILTER.destroy();
                }
            } catch(e) {
                console.error("Error during Jeeliz cleanup:", e);
            }
        };
    }, []);

    return (
        <div
            className="fixed w-6 h-6 bg-cyan-400 rounded-full border-2 border-white shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-linear"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 99999,
            }}
        />
    );
};

export default FaceTrackingCursor;