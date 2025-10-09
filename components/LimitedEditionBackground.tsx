import React, { useRef, useEffect } from 'react';

const LimitedEditionBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles: Particle[] = [];
        const particleCount = 2000;
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff', '#00ff00'];

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            life: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 0.5;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.life = Math.random() * 200 + 100;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life--;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                if (this.life <= 0) {
                    this.reset();
                }
            }
            
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.life = Math.random() * 200 + 100;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.life / 200;
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let animationFrameId: number;

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = window.requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', () => {});
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 bg-black" />;
};

export default LimitedEditionBackground;
