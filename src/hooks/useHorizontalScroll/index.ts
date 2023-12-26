import { useEffect, useRef, useState } from "react";
export default function useHorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setStartX(e.pageX - ref.current!.offsetLeft);
      setScrollLeft(ref.current!.scrollLeft);
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - ref.current!.offsetLeft;
      const walk = (x - startX) * 3; // scroll-fast
      ref.current!.scrollLeft = scrollLeft - walk;
    };

    const handleWheel = (e: WheelEvent) => {
      ref.current!.scrollLeft += e.deltaY;
    };

    const currentRef = ref.current;
    if (currentRef) {
      currentRef.addEventListener("mousedown", handleMouseDown);
      currentRef.addEventListener("mouseleave", handleMouseLeave);
      currentRef.addEventListener("mouseup", handleMouseUp);
      currentRef.addEventListener("mousemove", handleMouseMove);
      currentRef.addEventListener("wheel", handleWheel);
      return () => {
        currentRef.removeEventListener("mousedown", handleMouseDown);
        currentRef.removeEventListener("mouseleave", handleMouseLeave);
        currentRef.removeEventListener("mouseup", handleMouseUp);
        currentRef.removeEventListener("mousemove", handleMouseMove);
        currentRef.removeEventListener("wheel", handleWheel);
      };
    }
  }, [isDragging, startX, scrollLeft]);

  return ref;
}
