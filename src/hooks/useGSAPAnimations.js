import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export const useGSAPAnimations = () => {
  const timelineRef = useRef()

  useEffect(() => {
    // Create main timeline
    timelineRef.current = gsap.timeline()

    return () => {
      // Cleanup
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [])

  const animateProductHover = (element, isHovering) => {
    if (isHovering) {
      gsap.to(element, {
        scale: 1.1,
        y: -0.1,
        duration: 0.3,
        ease: "power2.out"
      })
    } else {
      gsap.to(element, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }

  const animateCameraTransition = (camera, targetPosition, targetLookAt, duration = 2) => {
    gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration,
      ease: "power3.inOut"
    })

    if (targetLookAt) {
      gsap.to(camera.rotation, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration,
        ease: "power3.inOut"
      })
    }
  }

  const animateUIElement = (element, show) => {
    if (show) {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          y: 20,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.7)"
        }
      )
    } else {
      gsap.to(element, {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.3,
        ease: "power2.in"
      })
    }
  }

  const animateProductEntry = (products) => {
    gsap.fromTo(products, 
      {
        opacity: 0,
        y: 0.5,
        scale: 0,
        rotationY: -180
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.2)"
      }
    )
  }

  return {
    animateProductHover,
    animateCameraTransition,
    animateUIElement,
    animateProductEntry
  }
}

export default useGSAPAnimations