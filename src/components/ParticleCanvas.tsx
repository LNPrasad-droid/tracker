import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  glow: number;
  pulsePhase: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  // Handle resizing using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Main animation logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // Adjust for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize Neural Network Nodes (fixed and moving clusters)
    const nodeCount = prefersReducedMotion ? 8 : Math.min(22, Math.floor((width * height) / 42000));
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.5,
        targetRadius: Math.random() * 3 + 2,
        glow: Math.random() * 10 + 5,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Interactive Floating Particles (finer dust)
    const particleCount = prefersReducedMotion ? 12 : Math.min(44, Math.floor((width * height) / 24000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.6 + 0.1,
        pulseSpeed: 0.005 + Math.random() * 0.01,
      });
    }

    let animationFrameId = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Cosmic ambient glow / dark void background
      const bgGrad = ctx.createRadialGradient(
        width / 2, height / 2, 5,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, '#040b19'); // Very deep tech blue
      bgGrad.addColorStop(1, '#020408'); // Pure obsidian black
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Connect Neural Network Nodes with lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)'; // sky-400 with ultra-low opacity
      ctx.lineWidth = 0.8;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connection range
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.15;
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Mouse interaction connections
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;

        // Draw magnetic force area indicator
        const mouseGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
        mouseGrad.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
        mouseGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 120, 0, Math.PI * 2);
        ctx.fill();

        // Connect nodes to mouse
        for (const node of nodes) {
          const dx = node.x - mx;
          const dy = node.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.18;
            ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`; // sky-500
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mx, my);
            ctx.stroke();

            // Gently pull node towards mouse
            node.vx -= (dx / dist) * 0.015;
            node.vy -= (dy / dist) * 0.015;
          }
        }
      }

      // Draw & Update Neural Network Nodes
      for (const node of nodes) {
        // Update positions (bounce on borders)
        node.x += node.vx;
        node.y += node.vy;

        // Friction / drag
        node.vx *= 0.98;
        node.vy *= 0.98;

        // Drift restore
        node.vx += (Math.random() - 0.5) * 0.02;
        node.vy += (Math.random() - 0.5) * 0.02;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Keep inside bounds
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));

        // Pulsing radius and glow effect
        node.pulsePhase += 0.015;
        const currentRadius = node.radius + Math.sin(node.pulsePhase) * 0.6;

        ctx.shadowBlur = node.glow + Math.sin(node.pulsePhase) * 3;
        ctx.shadowColor = '#06b6d4'; // cyan-500
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset shadow blur for performance on the fine dust
      ctx.shadowBlur = 0;

      // Draw & Update Dust Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Slow glow pulsing
        p.alpha += p.pulseSpeed;
        if (p.alpha > 0.65 || p.alpha < 0.1) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        ctx.fillStyle = `rgba(125, 211, 252, ${Math.max(0, Math.min(1, p.alpha))})`; // sky-200
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Energy Core at bottom center (subtle glowing arc or sphere)
      const coreX = width / 2;
      const coreY = height + 10;
      const coreGrad = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, 200);
      coreGrad.addColorStop(0, 'rgba(6, 182, 212, 0.09)');
      coreGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.02)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(coreX, coreY, 200, Math.PI, Math.PI * 2);
      ctx.fill();

      if (!document.hidden && !prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        animationFrameId = 0;
      }
    };

    draw();

    const handleVisibilityChange = () => {
      if (!document.hidden && !animationFrameId && !prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dimensions]);

  // Track mouse position over canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      style={{ zIndex: 0 }}
      id="neural-background"
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
