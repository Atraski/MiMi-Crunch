import { useEffect } from 'react';
import { gsap } from 'gsap';
import { getOptimizedImage } from '../utils/imageUtils';

const FlyToCart = ({ item, startPos, onComplete }) => {
    useEffect(() => {
        if (!item || !startPos) return;

        let isCancelled = false;

        // Create a temporary element for the animation
        const flyEl = document.createElement('div');
        const imageUrl = getOptimizedImage(item.image || (item.images && item.images[0]));

        flyEl.style.position = 'fixed';
        flyEl.style.left = '0px';
        flyEl.style.top = '0px';
        flyEl.style.width = '65px';
        flyEl.style.height = '65px';
        flyEl.style.backgroundImage = `url(${imageUrl})`;
        flyEl.style.backgroundSize = 'contain';
        flyEl.style.backgroundRepeat = 'no-repeat';
        flyEl.style.backgroundPosition = 'center';
        flyEl.style.zIndex = '99999';
        flyEl.style.pointerEvents = 'none';
        flyEl.style.borderRadius = '20px';
        flyEl.style.backgroundColor = 'white';
        flyEl.style.boxShadow = '0 15px 35px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)';
        flyEl.style.border = '4px solid rgba(255,255,255,0.9)';
        flyEl.style.backdropFilter = 'blur(10px)';
        flyEl.style.opacity = '0';

        flyEl.style.transform = `translate(${startPos.x - 32.5}px, ${startPos.y - 32.5}px)`;

        document.body.appendChild(flyEl);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const isMobile = window.innerWidth < 768;
        const targetId = isMobile ? 'cart-icon-mobile' : 'cart-icon-desktop';
        const targetEl = document.getElementById(targetId);

        let targetPos = { x: window.innerWidth - 60, y: 40 };
        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            targetPos = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        }

        const tl = gsap.timeline({
            onComplete: () => {
                if (isCancelled) return;
                if (document.body.contains(flyEl)) {
                    document.body.removeChild(flyEl);
                }
                onComplete?.();
            }
        });

        tl.to(flyEl, {
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
        });

        tl.to(flyEl, {
            x: centerX - 32.5,
            y: centerY - 32.5,
            scale: 1.5,
            rotation: 360,
            duration: 1.4,
            ease: "power2.in"
        }, "-=0.2")
            .to(flyEl, {
                x: targetPos.x - 32.5,
                y: targetPos.y - 32.5,
                scale: 0.1,
                rotation: 1080,
                opacity: 0.2,
                duration: 1.6,
                ease: "power2.out"
            });

        return () => {
            isCancelled = true;
            tl.kill();
            if (document.body.contains(flyEl)) {
                document.body.removeChild(flyEl);
            }
        };
    }, [item, startPos]); // onComplete is intentionally omitted to avoid resets during render

    return null;
};

export default FlyToCart;
