import React, { useRef, useEffect } from 'react';

const LimitedEditionBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef({
        particles: [] as any[],
        animationFrameId: 0,
        isActive: true,
        currentState: 'SCATTER', // SCATTER, FORM, HOLD
    });

    const TEXTS = [
        'vibe code', 'vibe anything', 'build fast', 'create magic',
        'build cool stuff', 'code dreams', 'ship it', 'think different',
        'design systems', 'hello, world', 'just build', 'innovate daily',
        'AI power', 'dream bigger', 'make it real', 'pixel perfect',
        'flow state', 'good vibes', 'future is now', 'beyond code',
        'start creating', 'imagine that', 'endless ideas', 'git push',
        'Silo Build', 'deploy', '10x dev', 'bug free', 'refactor',
    ];

    const FIGURES = [
        '{ }', '</>', 'lambda λ', '🚀', '⚙️',
    ];

    const FONT_SIZE = 100;
    const PARTICLE_COUNT = 3000;
    const EASE_FACTOR = 0.05;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        
        animationRef.current.isActive = true;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const getLandingPagePoints = (w: number, h: number) => {
            const points: { x: number, y: number }[] = [];
            const step = 6;
    
            const addRectPoints = (x: number, y: number, rectW: number, rectH: number, densityStep: number = step) => {
                for (let i = x; i < x + rectW; i += densityStep) {
                    for (let j = y; j < y + rectH; j += densityStep) {
                        points.push({ x: i, y: j });
                    }
                }
            };
    
            const navHeight = h * 0.08;
            addRectPoints(0, 0, w, navHeight, step * 2); 
            addRectPoints(w * 0.6, navHeight * 0.4, w * 0.08, h * 0.015, step);
            addRectPoints(w * 0.7, navHeight * 0.4, w * 0.08, h * 0.015, step);
            addRectPoints(w * 0.8, navHeight * 0.4, w * 0.08, h * 0.015, step);
            addRectPoints(w * 0.1, navHeight * 0.25, h * 0.05, h * 0.05, step / 2);
    
            const heroTop = h * 0.15;
            const heroHeight = h * 0.4;
            addRectPoints(w * 0.1, heroTop + h * 0.05, w * 0.35, h * 0.05, step);
            addRectPoints(w * 0.1, heroTop + h * 0.15, w * 0.3, h * 0.015, step);
            addRectPoints(w * 0.1, heroTop + h * 0.18, w * 0.28, h * 0.015, step);
            addRectPoints(w * 0.1, heroTop + h * 0.25, w * 0.15, h * 0.04, step / 2);
            addRectPoints(w * 0.55, heroTop, w * 0.35, heroHeight - h * 0.05, step / 2);
    
            const contentTop = h * 0.65;
            const blockWidth = w * 0.25;
            const blockHeight = h * 0.2;
            const gap = (w - (blockWidth * 3)) / 4;
    
            addRectPoints(gap, contentTop, blockWidth, blockHeight, step);
            addRectPoints(gap * 2 + blockWidth, contentTop, blockWidth, blockHeight, step);
            addRectPoints(gap * 3 + blockWidth * 2, contentTop, blockWidth, blockHeight, step);
    
            return points;
        };
        
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };
        window.addEventListener('resize', handleResize);

        class Particle {
            x: number; y: number; homeX: number; homeY: number;
            vx: number; vy: number; targetX: number | null = null; targetY: number | null = null;
            size: number; color: string;

            constructor() {
                this.homeX = Math.random() * width;
                this.homeY = Math.random() * height;
                this.x = this.homeX; this.y = this.homeY;
                this.vx = (Math.random() - 0.5) * 2; this.vy = (Math.random() - 0.5) * 2;
                this.size = Math.random() * 2 + 2;
                this.color = `hsl(${Math.random() * 360}, 100%, 75%)`;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }

            update() {
                const anim = animationRef.current;
                if ((anim.currentState === 'FORM' || anim.currentState === 'HOLD') && this.targetX !== null && this.targetY !== null) {
                    this.vx = (this.targetX - this.x) * EASE_FACTOR;
                    this.vy = (this.targetY - this.y) * EASE_FACTOR;
                    if (anim.currentState === 'HOLD') {
                        this.vx += (Math.random() - 0.5) * 0.2;
                        this.vy += (Math.random() - 0.5) * 0.2;
                    }
                    this.x += this.vx; this.y += this.vy;
                } else { // SCATTER
                    this.x += this.vx; this.y += this.vy;
                    if (this.x < 0 || this.x > width) this.vx *= -1;
                    if (this.y < 0 || this.y > height) this.vy *= -1;
                }
            }
        }
        
        const initParticles = () => {
            animationRef.current.particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                animationRef.current.particles.push(new Particle());
            }
        };

        const getTextPoints = (text: string) => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return [];
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCtx.font = `bold ${FONT_SIZE}px 'Orbitron', sans-serif`;
            tempCtx.fillStyle = 'white';
            const textMetrics = tempCtx.measureText(text);
            const textWidth = textMetrics.width;
            
            const startX = (width - textWidth) / 2;
            const startY = height / 2 + FONT_SIZE / 3;

            tempCtx.fillText(text, startX, startY);

            const imageData = tempCtx.getImageData(0, 0, width, height);
            const points = [];
            const step = 5;

            for (let y = 0; y < height; y += step) {
                for (let x = 0; x < width; x += step) {
                    const index = (y * width + x) * 4;
                    if (imageData.data[index + 3] > 128) {
                        points.push({ x, y });
                    }
                }
            }
            return points;
        };

        const assignTargets = (points: {x: number, y: number}[]) => {
            const shuffledPoints = [...points].sort(() => 0.5 - Math.random());
            animationRef.current.particles.forEach((p, i) => {
                const target = shuffledPoints[i % shuffledPoints.length];
                p.targetX = target ? target.x : Math.random() * width;
                p.targetY = target ? target.y : Math.random() * height;
            });
        };
        
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        const runAnimationSequence = async () => {
            if (animationRef.current.isActive) {
                const landingPagePoints = getLandingPagePoints(width, height);
                assignTargets(landingPagePoints);
                animationRef.current.currentState = 'FORM';
                await wait(5000);
                if (!animationRef.current.isActive) return;

                animationRef.current.currentState = 'HOLD';
                await wait(3000);
                if (!animationRef.current.isActive) return;

                animationRef.current.currentState = 'SCATTER';
                animationRef.current.particles.forEach(p => {
                    p.vx = (Math.random() - 0.5) * 4;
                    p.vy = (Math.random() - 0.5) * 4;
                });
                await wait(3000);
            }

            let textIndex = 0;
            let figureIndex = 0;
            let isTextTurn = true;

            while (animationRef.current.isActive) {
                const sequence = isTextTurn ? TEXTS : FIGURES;
                const index = isTextTurn ? textIndex : figureIndex;
                const text = sequence[index % sequence.length];
                
                const points = getTextPoints(text);
                assignTargets(points);
                animationRef.current.currentState = 'FORM';
                await wait(4000);

                if (!animationRef.current.isActive) return;

                animationRef.current.currentState = 'HOLD';
                await wait(2000);

                if (!animationRef.current.isActive) return;

                animationRef.current.currentState = 'SCATTER';
                animationRef.current.particles.forEach(p => {
                    p.vx = (Math.random() - 0.5) * 4;
                    p.vy = (Math.random() - 0.5) * 4;
                });
                await wait(3000);

                if (isTextTurn) {
                    textIndex++;
                } else {
                    figureIndex++;
                }
                isTextTurn = !isTextTurn;
            }
        };

        const animate = () => {
            if (!ctx || !animationRef.current.isActive) return;
            ctx.clearRect(0, 0, width, height);
            animationRef.current.particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationRef.current.animationFrameId = requestAnimationFrame(animate);
        };
        
        initParticles();
        animate();
        runAnimationSequence();

        return () => {
            animationRef.current.isActive = false;
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationRef.current.animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 bg-black" />;
};

export default LimitedEditionBackground;