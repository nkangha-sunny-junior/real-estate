// Recreates the topographic contour-line motif from the real Vision-H
// brand identity (seen on the letterhead and brand deck), as a subtle,
// low-opacity SVG background layer. Pure SVG, no images needed, so it's
// lightweight and scales cleanly at any screen size.
export default function TopoBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g stroke="#C9A15A" strokeWidth="1" opacity="0.12">
        <path d="M-50,80 Q150,20 300,90 T650,60 T900,100" />
        <path d="M-50,120 Q150,60 300,130 T650,100 T900,140" />
        <path d="M-50,160 Q150,100 300,170 T650,140 T900,180" />
        <path d="M-50,300 Q200,240 380,310 T750,280 T1000,320" />
        <path d="M-50,340 Q200,280 380,350 T750,320 T1000,360" />
        <path d="M-50,380 Q200,320 380,390 T750,360 T1000,400" />
        <path d="M-50,480 Q250,420 450,490 T800,460 T1050,500" />
        <path d="M-50,520 Q250,460 450,530 T800,500 T1050,540" />
      </g>
      <g stroke="#8B5E34" strokeWidth="1.5" opacity="0.1">
        <path d="M-50,140 Q150,80 300,150 T650,120 T900,160" />
        <path d="M-50,360 Q200,300 380,370 T750,340 T1000,380" />
      </g>
    </svg>
  );
}